import { apiFetch } from './api';
import { showToast } from './utils';

type ProctorFlagType = 'TAB_CHANGE' | 'WINDOW_SWITCH' | 'WINDOW_MINIMIZE' | 'FULLSCREEN_EXIT';

type ProctorOptions = {
    onPause?: (reason: string) => void;
    onResume?: () => void;
    cameraButtonId?: string;
    cameraPreviewId?: string;
    cameraPreviewPanelId?: string;
};

const FLAG_DETAILS: Record<ProctorFlagType, { title: string; description: string }> = {
    TAB_CHANGE: {
        title: 'Tab change detected',
        description: 'The exam tab became hidden or lost visibility.',
    },
    WINDOW_SWITCH: {
        title: 'Window switch detected',
        description: 'The browser window lost focus to another app or window.',
    },
    WINDOW_MINIMIZE: {
        title: 'Window minimize detected',
        description: 'The exam window appears to have been minimized or left the visible screen.',
    },
    FULLSCREEN_EXIT: {
        title: 'Fullscreen exit detected',
        description: 'The exam left fullscreen mode during the attempt.',
    },
};

export class Proctor {
    private readonly attemptId: number;
    private readonly options: ProctorOptions;
    private warnings = 0;
    private isFocused = document.hasFocus();
    private readonly startupGracePeriodMs = 2500;
    private readonly startedAtMs = Date.now();
    private readonly pendingFlags = new Map<
        ProctorFlagType,
        { count: number; firstDetectedAt: string; signals: Set<string> }
    >();
    private warningOverlay: HTMLDivElement | null = null;
    private warningDialog: HTMLDivElement | null = null;
    private cameraStream: MediaStream | null = null;
    private cameraButton: HTMLButtonElement | null = null;
    private cameraPreview: HTMLVideoElement | null = null;
    private cameraPreviewPanel: HTMLElement | null = null;
    private requirementMessage: HTMLParagraphElement | null = null;
    private isPaused = false;
    private hasEnteredFullscreen = false;
    private destroyed = false;

    private readonly handleVisibility = () => {
        if (this.shouldIgnoreLifecycleEvent()) return;
        if (this.isPaused) {
            this.updateRequirementStatus();
            return;
        }

        if (document.hidden) {
            this.detectFlag(
                this.isWindowVisiblyMinimized() ? 'WINDOW_MINIMIZE' : 'TAB_CHANGE',
                'document.visibilityState:hidden',
            );
        }
    };

    private readonly handleBlurEvent = () => {
        if (this.shouldIgnoreLifecycleEvent() || !this.isFocused || this.isPaused) return;

        this.isFocused = false;
        window.setTimeout(() => {
            if (this.destroyed || document.hidden) return;
            this.detectFlag('WINDOW_SWITCH', 'window.blur');
        }, 120);
    };

    private readonly handleFocusEvent = () => {
        if (this.shouldIgnoreLifecycleEvent()) return;

        if (!this.isFocused) {
            this.isFocused = true;
        }
    };

    private readonly handleFullscreenChange = () => {
        if (document.fullscreenElement) {
            this.hasEnteredFullscreen = true;
            this.updateRequirementStatus();
            return;
        }

        if (this.isPaused) {
            this.updateRequirementStatus();
        } else if (this.hasEnteredFullscreen && !this.destroyed) {
            this.detectFlag('FULLSCREEN_EXIT', 'fullscreenchange:exited');
        } else {
            this.updateRequirementStatus();
        }
    };

    private readonly handleResize = () => {
        if (this.shouldIgnoreLifecycleEvent()) return;
        if (this.isPaused) return;
        if (this.isWindowVisiblyMinimized()) {
            this.detectFlag('WINDOW_MINIMIZE', 'window.resize:minimized');
        }
    };

    constructor(attemptId: number, options: ProctorOptions = {}) {
        this.attemptId = attemptId;
        this.options = options;
        this.init();
    }

    private init() {
        this.cameraButton = document.getElementById(
            this.options.cameraButtonId || 'camera-toggle-btn',
        ) as HTMLButtonElement | null;
        this.cameraPreview = document.getElementById(
            this.options.cameraPreviewId || 'camera-preview',
        ) as HTMLVideoElement | null;
        this.cameraPreviewPanel = document.getElementById(
            this.options.cameraPreviewPanelId || 'camera-preview-panel',
        );

        this.cameraButton?.addEventListener('click', () => {
            void this.toggleCameraPreview();
        });
        document.addEventListener('visibilitychange', this.handleVisibility);
        document.addEventListener('fullscreenchange', this.handleFullscreenChange);
        window.addEventListener('blur', this.handleBlurEvent);
        window.addEventListener('focus', this.handleFocusEvent);
        window.addEventListener('resize', this.handleResize);

        this.presentSecurityGate();
    }

    private shouldIgnoreLifecycleEvent() {
        return Date.now() - this.startedAtMs < this.startupGracePeriodMs;
    }

    private isWindowVisiblyMinimized() {
        return window.outerWidth <= 160 || window.outerHeight <= 160;
    }

    private hasCameraAccess() {
        return Boolean(
            this.cameraStream?.getVideoTracks().some((track) => track.readyState === 'live'),
        );
    }

    private hasFullscreenAccess() {
        return Boolean(document.fullscreenElement);
    }

    private hasRequiredContext() {
        return this.hasCameraAccess() && this.hasFullscreenAccess();
    }

    private async logEvent(type: string, metadata: string) {
        try {
            await apiFetch(`/attempts/${this.attemptId}/log`, {
                method: 'POST',
                body: JSON.stringify({
                    event_type: type,
                    metadata_info: metadata,
                }),
            });
        } catch (error) {
            console.error('Failed to log proctoring event', error);
        }
    }

    private detectFlag(type: ProctorFlagType, signal: string) {
        if (this.destroyed) return;

        const existing = this.pendingFlags.get(type);
        if (existing) {
            existing.count += 1;
            existing.signals.add(signal);
        } else {
            this.pendingFlags.set(type, {
                count: 1,
                firstDetectedAt: new Date().toISOString(),
                signals: new Set([signal]),
            });
        }

        this.warnings += 1;
        this.pauseSession(FLAG_DETAILS[type].title);
        this.presentWarningPrompt();

        const metadata = JSON.stringify({
            warning_count: this.warnings,
            flag_type: type,
            signal,
            requires_camera: true,
            requires_fullscreen: true,
            recorded_at: new Date().toISOString(),
        });

        void this.logEvent(type, metadata);
        showToast(`${FLAG_DETAILS[type].title}. Test paused until checks are restored.`, 'warning');
    }

    private pauseSession(reason: string) {
        if (this.isPaused) return;
        this.isPaused = true;
        this.options.onPause?.(reason);
    }

    private presentSecurityGate() {
        if (this.hasRequiredContext()) return;

        this.pauseSession('Secure session setup required');
        this.presentWarningPrompt();
    }

    private getPendingFlagRows() {
        if (!this.pendingFlags.size) {
            return `
                <div class="proctor-flag-row">
                    <strong>Secure session setup</strong>
                    <span>Enable the camera preview and enter fullscreen mode to begin.</span>
                </div>
            `;
        }

        return Array.from(this.pendingFlags.entries())
            .map(([type, details]) => {
                const flag = FLAG_DETAILS[type];
                return `
                    <div class="proctor-flag-row">
                        <strong>${flag.title}${details.count > 1 ? ` (${details.count})` : ''}</strong>
                        <span>${flag.description}</span>
                    </div>
                `;
            })
            .join('');
    }

    private presentWarningPrompt() {
        if (!this.isPaused) return;

        if (this.warningOverlay && this.warningDialog) {
            this.renderWarningDialog();
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay proctor-overlay active';

        const modal = document.createElement('div');
        modal.className = 'modal proctor-modal';

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        document.body.classList.add('modal-open');

        this.warningOverlay = overlay;
        this.warningDialog = modal;
        this.renderWarningDialog();
    }

    private renderWarningDialog() {
        if (!this.warningDialog) return;

        this.warningDialog.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${
                    this.pendingFlags.size ? 'Proctoring pause' : 'Secure test setup'
                }</h3>
            </div>
            <div class="stack-list">
                <p class="helper-text">
                    ${
                        this.pendingFlags.size
                            ? 'A proctoring flag was detected. Your test is paused until the required exam context is restored.'
                            : 'Before you work on the paper, OEPS needs camera access and fullscreen mode.'
                    }
                </p>
                <div class="proctor-flag-list">
                    ${this.getPendingFlagRows()}
                </div>
                <div class="proctor-requirements">
                    <div class="proctor-requirement ${this.hasCameraAccess() ? 'ready' : ''}">
                        <span></span>
                        <div>
                            <strong>Camera access</strong>
                            <p>Live preview must be available on this device.</p>
                        </div>
                    </div>
                    <div class="proctor-requirement ${this.hasFullscreenAccess() ? 'ready' : ''}">
                        <span></span>
                        <div>
                            <strong>Fullscreen mode</strong>
                            <p>The exam must occupy the whole screen.</p>
                        </div>
                    </div>
                </div>
                <p class="helper-text proctor-requirement-message" id="proctor-requirement-message">
                    Click continue to enable camera access and fullscreen mode.
                </p>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="proctor-warning-ack">Continue</button>
                </div>
            </div>
        `;

        this.requirementMessage = this.warningDialog.querySelector<HTMLParagraphElement>(
            '#proctor-requirement-message',
        );

        this.warningDialog.querySelector<HTMLButtonElement>('#proctor-warning-ack')?.addEventListener('click', () => {
            void this.continueWhenRequirementsPass();
        });
    }

    private setRequirementMessage(message: string, tone: 'info' | 'error' = 'info') {
        if (!this.requirementMessage) return;
        this.requirementMessage.textContent = message;
        this.requirementMessage.classList.toggle('text-danger', tone === 'error');
    }

    private updateRequirementStatus() {
        if (this.isPaused) {
            this.renderWarningDialog();
        }
        this.updateCameraUi();
    }

    private async ensureFullscreenAccess() {
        if (this.hasFullscreenAccess()) return true;
        if (!document.fullscreenEnabled || !document.documentElement.requestFullscreen) {
            this.setRequirementMessage('Fullscreen mode is not available in this browser.', 'error');
            return false;
        }

        try {
            await document.documentElement.requestFullscreen();
            this.hasEnteredFullscreen = true;
            return this.hasFullscreenAccess();
        } catch {
            this.setRequirementMessage('Fullscreen permission was not granted. Keep this page open and try again.', 'error');
            return false;
        }
    }

    private async ensureCameraAccess({ showPreview = true } = {}) {
        if (this.hasCameraAccess()) {
            if (showPreview) this.showCameraPreview();
            return true;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            this.setRequirementMessage('Camera access is not available in this browser.', 'error');
            return false;
        }

        try {
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });
            this.cameraStream.getVideoTracks().forEach((track) => {
                track.addEventListener('ended', () => {
                    this.cameraStream = null;
                    this.updateRequirementStatus();
                    if (!this.destroyed && !this.isPaused) {
                        this.presentSecurityGate();
                    }
                });
            });
            this.attachCameraStream();
            if (showPreview) this.showCameraPreview();
            this.updateCameraUi();
            return true;
        } catch {
            this.setRequirementMessage('Camera permission was not granted. Allow camera access to continue.', 'error');
            this.updateCameraUi();
            return false;
        }
    }

    private attachCameraStream() {
        if (!this.cameraPreview || !this.cameraStream) return;
        this.cameraPreview.srcObject = this.cameraStream;
        void this.cameraPreview.play().catch(() => undefined);
    }

    private showCameraPreview() {
        if (this.cameraPreviewPanel) {
            this.cameraPreviewPanel.hidden = false;
        }
        this.attachCameraStream();
        this.updateCameraUi();
    }

    private hideCameraPreview() {
        if (this.cameraPreviewPanel) {
            this.cameraPreviewPanel.hidden = true;
        }
        this.updateCameraUi();
    }

    private updateCameraUi() {
        if (!this.cameraButton) return;
        const previewVisible = Boolean(this.cameraPreviewPanel && !this.cameraPreviewPanel.hidden);
        const cameraReady = this.hasCameraAccess();
        this.cameraButton.classList.toggle('btn-success', cameraReady);
        this.cameraButton.setAttribute('aria-pressed', previewVisible ? 'true' : 'false');
        this.cameraButton.innerHTML = cameraReady
            ? previewVisible
                ? 'Hide camera'
                : 'Show camera'
            : 'Enable camera';
    }

    private async toggleCameraPreview() {
        if (!this.hasCameraAccess()) {
            const granted = await this.ensureCameraAccess({ showPreview: true });
            if (granted) {
                showToast('Camera preview is active.', 'success');
            }
            return;
        }

        if (this.cameraPreviewPanel?.hidden) {
            this.showCameraPreview();
        } else {
            this.hideCameraPreview();
        }
    }

    private async continueWhenRequirementsPass() {
        this.setRequirementMessage('Checking camera and fullscreen requirements...');

        const fullscreenReady = await this.ensureFullscreenAccess();
        const cameraReady = await this.ensureCameraAccess({ showPreview: true });

        if (!fullscreenReady || !cameraReady) {
            this.renderWarningDialog();
            this.setRequirementMessage(
                !fullscreenReady
                    ? 'Fullscreen mode is still required. Keep this page open and try again.'
                    : 'Camera access is still required. Allow camera permission to continue.',
                'error',
            );
            return;
        }

        const hadFlags = this.pendingFlags.size > 0;
        this.pendingFlags.clear();
        this.removeWarningPrompt();
        this.isPaused = false;
        this.options.onResume?.();
        showToast('Exam resumed. Camera and fullscreen checks are active.', 'success');
        if (hadFlags) {
            this.showWarningFlash();
        }
    }

    private removeWarningPrompt() {
        this.warningDialog?.remove();
        this.warningOverlay?.remove();
        this.warningDialog = null;
        this.warningOverlay = null;
        document.body.classList.remove('modal-open');
    }

    private showWarningFlash() {
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.inset = '0';
        flash.style.background = 'rgba(220, 38, 38, 0.14)';
        flash.style.zIndex = '9999';
        flash.style.pointerEvents = 'none';
        flash.style.transition = 'opacity 600ms ease';
        document.body.appendChild(flash);

        window.setTimeout(() => {
            flash.style.opacity = '0';
            window.setTimeout(() => flash.remove(), 600);
        }, 250);
    }

    public destroy() {
        this.destroyed = true;
        document.removeEventListener('visibilitychange', this.handleVisibility);
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
        window.removeEventListener('blur', this.handleBlurEvent);
        window.removeEventListener('focus', this.handleFocusEvent);
        window.removeEventListener('resize', this.handleResize);
        this.pendingFlags.clear();
        this.cameraStream?.getTracks().forEach((track) => track.stop());
        this.cameraStream = null;
        if (this.cameraPreview) {
            this.cameraPreview.srcObject = null;
        }
        this.removeWarningPrompt();
    }
}
