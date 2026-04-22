import { apiFetch } from './api';
import { showToast } from './utils';

export class Proctor {
    private readonly attemptId: number;
    private warnings = 0;
    private isFocused = true;

    private readonly handleVisibility = () => {
        if (!document.hidden) return;

        this.warnings += 1;
        void this.logEvent('TAB_SWITCH', `User switched tab. Warnings: ${this.warnings}`);
        showToast('Tab switching is monitored and reported.', 'warning');
        this.showWarningFlash();
    };

    private readonly handleBlurEvent = () => {
        if (!this.isFocused) return;

        this.isFocused = false;
        void this.logEvent('WINDOW_BLUR', 'User moved focus away from the exam window');
    };

    private readonly handleFocusEvent = () => {
        if (this.isFocused) return;

        this.isFocused = true;
        void this.logEvent('WINDOW_FOCUS', 'User returned to the exam window');
    };

    constructor(attemptId: number) {
        this.attemptId = attemptId;
        this.init();
    }

    private init() {
        document.addEventListener('visibilitychange', this.handleVisibility);
        window.addEventListener('blur', this.handleBlurEvent);
        window.addEventListener('focus', this.handleFocusEvent);
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
    }
}
