import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainPage from './components/MainPage/MainPage';

describe('GiftLink home page', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
        });
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('shows the public gifts list and its empty state', async () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <MainPage />
                </AuthProvider>
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /find your next useful thing/i })).toBeInTheDocument();
        expect(await screen.findByText(/there are no gifts available yet/i)).toBeInTheDocument();
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/gifts$/),
            expect.objectContaining({ signal: expect.any(AbortSignal) })
        );
    });
});
