import { urlConfig } from './config';

export async function apiRequest(path, options) {
    const url = `${urlConfig.backendUrl}${path}`;
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type') || '(missing)';

    if (!/\bjson\b/i.test(contentType)) {
        throw new Error(
            `Expected a JSON response from ${url}, but received ${contentType} (HTTP ${response.status}). `
            + 'Verify that VITE_BACKEND_URL points to the GiftLink backend.'
        );
    }

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error(
            `The response from ${url} was not valid JSON (HTTP ${response.status}, ${contentType}).`
        );
    }

    return { response, data };
}
