import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useAppContext } from '../../context/AuthContext';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAppContext();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const { response, data } = await apiRequest('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!response.ok) {
                throw new Error(data.error || `Registration failed (HTTP ${response.status})`);
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
            <h1 className="h2">Create your GiftLink account</h1>
            <form className="card card-body auth-form" onSubmit={submit}>
                <label className="form-label" htmlFor="register-name">Name</label>
                <input className="form-control mb-3" id="register-name" name="name" autoComplete="name" maxLength="100" required value={form.name} onChange={updateField} />
                <label className="form-label" htmlFor="register-email">Email</label>
                <input className="form-control mb-3" id="register-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={updateField} />
                <label className="form-label" htmlFor="register-password">Password</label>
                <input className="form-control mb-3" id="register-password" name="password" type="password" autoComplete="new-password" minLength="8" maxLength="128" required value={form.password} onChange={updateField} />
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button>
            </form>
            <p className="mt-3">Already a member? <Link to="/login">Log in</Link>.</p>
        </section>
    );
}
