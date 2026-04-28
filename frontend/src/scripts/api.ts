import { buildApiUrl } from './utils';

function shouldSetJsonContentType(body: BodyInit | null | undefined): boolean {
    return !!body && !(body instanceof FormData);
}

export async function apiFetch<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);

    if (shouldSetJsonContentType(options.body) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    let response: Response;

    try {
        response = await fetch(buildApiUrl(endpoint), {
            ...options,
            headers,
            credentials: 'include',
        });
    } catch {
        throw new Error('Unable to reach the server right now.');
    }

    if (response.status === 401) {
        window.location.href = '/';
        throw new Error('Your session has expired.');
    }

    const isJsonResponse = response.headers
        .get('content-type')
        ?.includes('application/json');

    const payload =
        response.status === 204
            ? null
            : isJsonResponse
              ? await response.json().catch(() => null)
              : await response.text().catch(() => null);

    if (!response.ok) {
        let message = `Request failed with status ${response.status}.`;

        if (payload && typeof payload === 'object' && 'detail' in payload) {
            const detail = (payload as { detail?: unknown }).detail;
            if (typeof detail === 'string' && detail.trim()) {
                message = detail;
            } else if (Array.isArray(detail) && detail.length) {
                message = detail
                    .map((entry) => {
                        if (typeof entry === 'string') return entry;
                        if (
                            entry &&
                            typeof entry === 'object' &&
                            'msg' in entry &&
                            typeof (entry as { msg?: unknown }).msg === 'string'
                        ) {
                            return String((entry as { msg: string }).msg);
                        }
                        return null;
                    })
                    .filter((entry): entry is string => Boolean(entry))
                    .join('; ');
            }
        } else if (typeof payload === 'string' && payload.trim()) {
            const trimmed = payload.trim();
            const looksLikeHtml = /^<!doctype html>|^<html[\s>]/i.test(trimmed);
            if (!looksLikeHtml) {
                message = trimmed;
            } else if (response.status >= 500) {
                message = `Server error (${response.status}). Check the backend logs.`;
            }
        } else if (response.status >= 500) {
            message = `Server error (${response.status}). Check the backend logs.`;
        }

        throw new Error(message);
    }

    return payload as T;
}
