import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { AuthProvider } from '../../context/AuthContext';

describe('Registration form', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        sessionStorage.clear();
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            headers: { get: () => 'application/json; charset=utf-8' },
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

    it('sends the required method and headers and stores the successful session', async () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <RegisterPage />
                </AuthProvider>
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Sam' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'sam@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'a-safe-test-password' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

        await waitFor(() => expect(global.fetch).toHaveBeenCalled());
        expect(global.fetch).toHaveBeenCalledWith('https://giftlink-backend-9171.onrender.com/api/auth/register', expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        }));
        await waitFor(() => {
            expect(sessionStorage.getItem('auth-token')).toBe('test-token');
            expect(sessionStorage.getItem('name')).toBe('Sam');
        });
    });
});
