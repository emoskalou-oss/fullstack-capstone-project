import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { urlConfig } from '../../config';

const categories = ['Living', 'Bedroom', 'Bathroom', 'Kitchen', 'Office'];
const conditions = ['New', 'Like New', 'Older'];

export default function NewGiftPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', category: '', condition: '', age_years: '0', description: '', image: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    const submit = async (event) => {
        event.preventDefault();
        const token = sessionStorage.getItem('auth-token');
        if (!token) {
            navigate('/login');
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            const response = await fetch(`${urlConfig.backendUrl}/api/gifts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...form, age_years: Number(form.age_years) }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Gift could not be published (HTTP ${response.status})`);
            }
            navigate(`/gifts/${encodeURIComponent(data.id)}`);
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!sessionStorage.getItem('auth-token')) {
        return <section className="container gift-page"><div className="alert alert-info">Please <Link to="/login">log in</Link> to publish a gift.</div></section>;
    }

    return (
        <section className="container gift-page auth-page">
            <h1 className="h2">Offer a gift</h1>
            <form className="card card-body auth-form" onSubmit={submit}>
                <label className="form-label" htmlFor="gift-name">Name</label>
                <input className="form-control mb-3" id="gift-name" name="name" maxLength="120" required value={form.name} onChange={updateField} />
                <label className="form-label" htmlFor="gift-category">Category</label>
                <select className="form-select mb-3" id="gift-category" name="category" required value={form.category} onChange={updateField}>
                    <option value="">Choose a category</option>
                    {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
                <label className="form-label" htmlFor="gift-condition">Condition</label>
                <select className="form-select mb-3" id="gift-condition" name="condition" required value={form.condition} onChange={updateField}>
                    <option value="">Choose a condition</option>
                    {conditions.map((condition) => <option key={condition}>{condition}</option>)}
                </select>
                <label className="form-label" htmlFor="gift-age">Age in years</label>
                <input className="form-control mb-3" id="gift-age" name="age_years" type="number" min="0" max="100" step="0.1" required value={form.age_years} onChange={updateField} />
                <label className="form-label" htmlFor="gift-description">Description</label>
                <textarea className="form-control mb-3" id="gift-description" name="description" rows="4" maxLength="5000" required value={form.description} onChange={updateField} />
                <label className="form-label" htmlFor="gift-image">Image URL or path (optional)</label>
                <input className="form-control mb-3" id="gift-image" name="image" type="text" placeholder="https://… or /images/example.jpeg" value={form.image} onChange={updateField} />
                {error && <div className="alert alert-danger" role="alert">{error}</div>}
                <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Publishing…' : 'Publish gift'}</button>
            </form>
        </section>
    );
}
