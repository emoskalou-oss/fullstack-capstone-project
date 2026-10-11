import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useAppContext } from '../../context/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAppContext();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const { response, data } = await apiRequest('/api/auth/login', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem('auth-token') || ''}`,
                },
                body: JSON.stringify(form),
            });
            if (!response.ok) {
                throw new Error(data.error || `Login failed (HTTP ${response.status})`);
            }
            login(data.user, data.token);
            navigate('/');
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="container gift-page auth-page">
            <h1 className="h2">Log in to GiftLink</h1>
            <form className="card card-body auth-form" onSubmit={submit}>
                <label className="form-label" htmlFor="login-email">Email</label>
                <input className="form-control mb-3" id="login-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={updateField} />
                <label className="form-label" htmlFor="login-password">Password</label>
                <input className="form-control mb-3" id="login-password" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={updateField} />
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Log in'}</button>
            </form>
            <p className="mt-3">New to GiftLink? <Link to="/register">Create an account</Link>.</p>
        </section>
    );
}
