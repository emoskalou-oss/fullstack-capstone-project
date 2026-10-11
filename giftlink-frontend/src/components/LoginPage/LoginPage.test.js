import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '../../context/AuthContext';

describe('Login form', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        sessionStorage.clear();
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                token: 'test-token',
                user: { name: 'Sam', email: 'sam@example.com' },
            }),
        });
    });

    afterEach(() => {
        sessionStorage.clear();
        global.fetch = originalFetch;
    });

    it('sends JSON and an Authorization header and stores the successful session', async () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'sam@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'a-safe-test-password' } });
        fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

        await waitFor(() => expect(global.fetch).toHaveBeenCalled());
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Authorization: 'Bearer ',
            },
        }));
        await waitFor(() => {
            expect(sessionStorage.getItem('auth-token')).toBe('test-token');
            expect(sessionStorage.getItem('email')).toBe('sam@example.com');
        });
    });
});
