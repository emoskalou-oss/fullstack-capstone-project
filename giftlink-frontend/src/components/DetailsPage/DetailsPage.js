import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../../api';
import { useAppContext } from '../../context/AuthContext';
import './DetailsPage.css';

function DetailsPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn } = useAppContext();
    const [gift, setGift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comment, setComment] = useState('');
    const [commentError, setCommentError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        const fetchGift = async () => {
            setLoading(true);
            setError('');
            try {
                const { response, data } = await apiRequest(
                    `/api/gifts/${encodeURIComponent(productId)}`,
                    { signal: controller.signal }
                );
                if (response.status === 404) {
                    setGift(null);
                    return;
                }
                if (!response.ok) {
                    throw new Error(`Unable to load gift (HTTP ${response.status})`);
                }
                setGift(data);
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
        window.scrollTo(0, 0);
        fetchGift();
        return () => controller.abort();
    }, [productId]);

    const submitComment = async (event) => {
        event.preventDefault();
        setCommentError('');
        setSubmitting(true);
        try {
            const { response, data } = await apiRequest(
                `/api/gifts/${encodeURIComponent(productId)}/comments`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${sessionStorage.getItem('auth-token') || ''}`,
                    },
                    body: JSON.stringify({ comment }),
                }
            );
            if (!response.ok) {
                throw new Error(data.error || `Unable to post comment (HTTP ${response.status})`);
            }
            setGift((current) => ({ ...current, comments: [...(current.comments || []), data] }));
            setComment('');
        } catch (submitError) {
            setCommentError(submitError.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container gift-page" role="status">Loading gift…</div>;
    if (error) return <div className="container gift-page"><div className="alert alert-danger" role="alert">{error}</div></div>;
    if (!gift) return <div className="container gift-page"><div className="alert alert-warning">Gift not found.</div><Link to="/">Back to gifts</Link></div>;

    const comments = Array.isArray(gift.comments) ? gift.comments : [];
    return (
        <div className="container gift-page">
            <button className="btn btn-link px-0 mb-3" type="button" onClick={() => navigate(-1)}>← Back</button>
            <article className="card product-details-card">
                <div className="card-header text-white">
                    <h1 className="details-title h2 mb-0">{gift.name}</h1>
                </div>
                <div className="card-body">
                    <div className="image-placeholder-large">
                        {gift.image ? (
                            <img className="product-image-large" src={gift.image} alt={gift.name} />
                        ) : (
                            <div className="no-image-available-large">No image available</div>
                        )}
                    </div>
                    <dl className="gift-details-list mt-4">
                        <div><dt>Category</dt><dd>{gift.category}</dd></div>
                        <div><dt>Condition</dt><dd>{gift.condition}</dd></div>
                        <div><dt>Date added</dt><dd>{gift.date_added ? new Date(gift.date_added * 1000).toLocaleDateString() : 'Not specified'}</dd></div>
                        <div><dt>Age (years)</dt><dd>{gift.age_years ?? 'Not specified'}</dd></div>
                        <div><dt>Description</dt><dd>{gift.description}</dd></div>
                    </dl>
                </div>
            </article>

            <section className="comments-section mt-4" aria-labelledby="comments-heading">
                <h2 id="comments-heading" className="h3 mb-3">Comments ({comments.length})</h2>
                {comments.length === 0 && <p className="text-muted">No comments yet.</p>}
                {comments.map((item, index) => (
                    <article key={`${item.createdAt || item.comment}-${index}`} className="card mb-3">
                        <div className="card-body">
                            <p className="comment-author mb-1"><strong>{item.author || 'Community member'}</strong></p>
                            <p className="comment-text mb-0">{item.comment}</p>
                        </div>
                    </article>
                ))}
                {isLoggedIn ? (
                    <form className="card card-body mt-3" onSubmit={submitComment}>
                        <label className="form-label" htmlFor="comment">Add a comment</label>
                        <textarea id="comment" className="form-control mb-3" rows="3" maxLength="1000" required value={comment} onChange={(event) => setComment(event.target.value)} />
                        {commentError && <div className="alert alert-danger" role="alert">{commentError}</div>}
                        <button className="btn btn-primary align-self-start" type="submit" disabled={submitting || !comment.trim()}>
                            {submitting ? 'Posting…' : 'Post comment'}
                        </button>
                    </form>
                ) : (
                    <p><Link to="/login">Log in</Link> to add a comment.</p>
                )}
            </section>
        </div>
    );
}

export default DetailsPage;
