import { apiFetch } from './api';
import { showToast } from './utils';

export class Proctor {
    private readonly attemptId: number;
    private readonly examAccessToken: string;
    private warnings = 0;
    private isFocused = document.hasFocus();
    private readonly startupGracePeriodMs = 2500;
    private readonly startedAtMs = Date.now();
    private readonly pendingReasons = new Set<string>();
    private warningOverlay: HTMLDivElement | null = null;
    private warningDialog: HTMLDivElement | null = null;

    private readonly handleVisibility = () => {
        if (this.shouldIgnoreLifecycleEvent()) return;

        if (document.hidden) {
            this.pendingReasons.add('document_hidden');
            return;
        }

        this.presentWarningPrompt();
    };

    private readonly handleBlurEvent = () => {
        if (this.shouldIgnoreLifecycleEvent() || !this.isFocused) return;

        this.isFocused = false;
        this.pendingReasons.add('window_blur');
    };

    private readonly handleFocusEvent = () => {
        if (this.shouldIgnoreLifecycleEvent()) return;

        if (!this.isFocused) {
            this.isFocused = true;
        }

        this.presentWarningPrompt();
    };

    constructor(attemptId: number, examAccessToken: string) {
        this.attemptId = attemptId;
        this.examAccessToken = examAccessToken;
        this.init();
    }

    private init() {
        document.addEventListener('visibilitychange', this.handleVisibility);
        window.addEventListener('blur', this.handleBlurEvent);
        window.addEventListener('focus', this.handleFocusEvent);
    }

    private shouldIgnoreLifecycleEvent() {
        return Date.now() - this.startedAtMs < this.startupGracePeriodMs;
    }

    private async logEvent(type: string, metadata: string) {
        try {
            await apiFetch(`/attempts/${this.attemptId}/log`, {
                method: 'POST',
                headers: {
                    'X-Exam-Access-Token': this.examAccessToken,
                },
                body: JSON.stringify({
                    event_type: type,
                    metadata_info: metadata,
                }),
            });
        } catch (error) {
            console.error('Failed to log proctoring event', error);
        }
    }

    private presentWarningPrompt() {
        if (!this.pendingReasons.size || this.warningOverlay) return;

        // Browsers cannot enumerate every other tab or window here, so we warn
        // based on supported focus/visibility signals and record a single incident.
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">Exam focus warning</h3>
            </div>
            <div class="stack-list">
                <p class="helper-text">
                    This exam window lost trusted focus or became hidden. Review any other tabs or windows you may have open and close anything unrelated before you continue.
                </p>
                <p class="helper-text">
                    Browsers cannot enumerate every other tab or window, so this warning is based on supported focus and visibility signals only.
                </p>
                <p class="helper-text">
                    When you continue, this incident will be flagged and recorded. Your exam will remain active.
                </p>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="proctor-warning-ack">Flag and continue</button>
                </div>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        document.body.classList.add('modal-open');

        this.warningOverlay = overlay;
        this.warningDialog = modal;

        modal.querySelector<HTMLButtonElement>('#proctor-warning-ack')?.addEventListener('click', () => {
            void this.acknowledgePendingWarning();
        });
    }

    private async acknowledgePendingWarning() {
        if (!this.pendingReasons.size) {
            this.removeWarningPrompt();
            return;
        }

        this.warnings += 1;
        const reasons = Array.from(this.pendingReasons);
        this.pendingReasons.clear();
        this.removeWarningPrompt();

        const metadata = JSON.stringify({
            warning_count: this.warnings,
            reasons,
            browser_capability_note:
                'The browser can detect focus and visibility loss, but it cannot enumerate all other tabs or windows.',
            recorded_at: new Date().toISOString(),
        });

        await this.logEvent('TRUSTED_CONTEXT_EXIT', metadata);
        showToast('A focus-loss event was flagged. Your exam is still active.', 'warning');
        this.showWarningFlash();
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
        document.removeEventListener('visibilitychange', this.handleVisibility);
        window.removeEventListener('blur', this.handleBlurEvent);
        window.removeEventListener('focus', this.handleFocusEvent);
        this.pendingReasons.clear();
        this.removeWarningPrompt();
    }
}
