import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './api';
import { urlConfig } from './config';

describe('API requests', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('sends requests to the configured backend and parses JSON', async () => {
        const json = [{ id: '875' }];
        const fetch = vi.fn().mockResolvedValue({
            status: 200,
            ok: true,
            headers: { get: () => 'application/json; charset=utf-8' },
            json: async () => json,
        });
        vi.stubGlobal('fetch', fetch);

        const result = await apiRequest('/api/gifts/search');

        expect(fetch).toHaveBeenCalledWith(`${urlConfig.backendUrl}/api/gifts/search`, undefined);
        expect(result.data).toEqual(json);
    });

    it('reports a clear configuration error when the backend returns HTML', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            status: 200,
            ok: true,
            headers: { get: () => 'text/html; charset=utf-8' },
            json: async () => {
                throw new SyntaxError("Unexpected token '<'");
            },
        }));

        await expect(apiRequest('/api/gifts')).rejects.toThrow(
            `Expected a JSON response from ${urlConfig.backendUrl}/api/gifts, but received text/html; charset=utf-8 (HTTP 200).`
        );
    });
});
