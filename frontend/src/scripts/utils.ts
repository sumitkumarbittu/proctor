const configuredApiBaseUrl =
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '/api/v1';

export const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, '');

export function buildApiUrl(endpoint: string): string {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${normalizedEndpoint}`;
}

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

const IST_TIME_ZONE = 'Asia/Kolkata';
const IST_OFFSET_MINUTES = 330;

function hasExplicitTimeZone(value: string): boolean {
    return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
}

export function parseApiDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    const normalized = hasExplicitTimeZone(trimmed) ? trimmed : `${trimmed}Z`;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return null;
    return date;
}

export function formatDateTimeIst(value: string | Date | null | undefined): string {
    const date = typeof value === 'string' ? parseApiDate(value) : value;
    if (!date || Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('en-IN', {
        timeZone: IST_TIME_ZONE,
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    }).format(date);
}

export function formatDateTimeIstCompact(value: string | Date | null | undefined): string {
    const date = typeof value === 'string' ? parseApiDate(value) : value;
    if (!date || Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('en-IN', {
        timeZone: IST_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

function pad2(value: number): string {
    return value.toString().padStart(2, '0');
}

export function toDateTimeLocalIstValue(value?: string | null): string {
    const date = parseApiDate(value || null);
    if (!date) return '';

    const istMs = date.getTime() + IST_OFFSET_MINUTES * 60_000;
    const ist = new Date(istMs);
    return `${ist.getUTCFullYear()}-${pad2(ist.getUTCMonth() + 1)}-${pad2(ist.getUTCDate())}T${pad2(
        ist.getUTCHours(),
    )}:${pad2(ist.getUTCMinutes())}`;
}

export function fromDateTimeLocalIstValue(value: string): string | null {
    if (!value) return null;
    const match = value.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
    );
    if (!match) return null;

    const year = Number.parseInt(match[1], 10);
    const month = Number.parseInt(match[2], 10);
    const day = Number.parseInt(match[3], 10);
    const hour = Number.parseInt(match[4], 10);
    const minute = Number.parseInt(match[5], 10);
    const second = match[6] ? Number.parseInt(match[6], 10) : 0;

    const utcMs =
        Date.UTC(year, month - 1, day, hour, minute, second) - IST_OFFSET_MINUTES * 60_000;
    const date = new Date(utcMs);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
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
