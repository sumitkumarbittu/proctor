export const API_BASE_URL = '/api/v1';

export function getAuthToken(): string | null {
    return localStorage.getItem('token');
}

export function setAuthToken(token: string) {
    localStorage.setItem('token', token);
}

export function removeAuthToken() {
    localStorage.removeItem('token');
}

export function formatTime(totalSeconds: number): string {
    const safeSeconds = Math.max(0, totalSeconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    const totalMinutes = Math.floor(safeSeconds / 60);
    return `${totalMinutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
}

export function debounce<T extends unknown[]>(
    func: (...args: T) => void,
    wait: number,
) {
    let timeout: number | undefined;

    return (...args: T) => {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
            func(...args);
        }, wait);
    };
}

export function getUserInitials(name: string | null, email: string): string {
    if (name) {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    return email[0].toUpperCase();
}

export function showToast(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons: Record<string, string> = {
        success: '✓',
        error: '✕',
        warning: '!',
        info: 'i',
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = document.createElement('span');
    icon.textContent = icons[type];

    const text = document.createElement('span');
    text.textContent = message;

    toast.append(icon, text);
    container.appendChild(toast);

    window.setTimeout(() => {
        toast.classList.add('removing');
        window.setTimeout(() => toast.remove(), 200);
    }, 3500);
}

export function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
        DRAFT: 'badge-info',
        SCHEDULED: 'badge-warning',
        LIVE: 'badge-success',
        CLOSED: 'badge-danger',
        RESULT_PUBLISHED: 'badge-purple',
        IN_PROGRESS: 'badge-warning',
        SUBMITTED: 'badge-info',
        EVALUATED: 'badge-success',
    };

    return map[status] || 'badge-info';
}
