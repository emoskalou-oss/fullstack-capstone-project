import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useAppContext } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const { updateUser } = useAppContext();
    const [userDetails, setUserDetails] = useState(null);
    const [updatedName, setUpdatedName] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const token = sessionStorage.getItem('auth-token');
        if (!token) {
            navigate('/login', { replace: true });
            return undefined;
        }

        const controller = new AbortController();
        const fetchProfile = async () => {
            try {
                const { response, data } = await apiRequest('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error(data.error || 'Unable to load profile');
                }
                setUserDetails(data);
                setUpdatedName(data.name);
            } catch (fetchError) {
                if (fetchError.name !== 'AbortError') {
                    setError(fetchError.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };
        fetchProfile();
        return () => controller.abort();
    }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        try {
            const { response, data } = await apiRequest('/api/auth/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem('auth-token') || ''}`,
                },
                body: JSON.stringify({ name: updatedName }),
            });
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }
            setUserDetails(data);
            updateUser(data);
            setEditMode(false);
            setMessage('Name updated successfully.');
        } catch (submitError) {
            setError(submitError.message);
        }
    };

    if (loading) return <div className="container gift-page" role="status">Loading profile…</div>;
    if (!userDetails && !error) return null;

    return (
        <section className="container gift-page profile-container">
            <h1 className="h2">Your profile</h1>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {message && <div className="alert alert-success" role="status">{message}</div>}
            {userDetails && (editMode ? (
                <form className="card card-body profile-form" onSubmit={handleSubmit}>
                    <label className="form-label" htmlFor="profile-email">Email</label>
                    <input id="profile-email" className="form-control mb-3" type="email" value={userDetails.email} disabled />
                    <label className="form-label" htmlFor="profile-name">Name</label>
                    <input id="profile-name" className="form-control mb-3" type="text" minLength="1" maxLength="100" required value={updatedName} onChange={(event) => setUpdatedName(event.target.value)} />
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary" type="submit">Save changes</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={() => { setUpdatedName(userDetails.name); setEditMode(false); }}>Cancel</button>
                    </div>
                </form>
            ) : (
                <div className="card card-body profile-details">
                    <h2 className="h4">Hello, {userDetails.name}</h2>
                    <p><strong>Email:</strong> {userDetails.email}</p>
                    <button className="btn btn-outline-primary align-self-start" type="button" onClick={() => setEditMode(true)}>Edit name</button>
                </div>
            ))}
            <p className="mt-4"><Link to="/">Browse gifts</Link></p>
        </section>
    );
};

export default Profile;
