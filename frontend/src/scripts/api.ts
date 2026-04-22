import { getAuthToken, API_BASE_URL } from './utils';

function shouldSetJsonContentType(body: BodyInit | null | undefined): boolean {
    return !!body && !(body instanceof FormData);
}

export async function apiFetch<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const token = getAuthToken();
    const headers = new Headers(options.headers);

    if (shouldSetJsonContentType(options.body) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    let response: Response;

    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
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
        const message =
            payload && typeof payload === 'object' && 'detail' in payload
                ? String((payload as { detail?: string }).detail || 'API request failed')
                : 'API request failed';
        throw new Error(message);
    }

    return payload as T;
}
