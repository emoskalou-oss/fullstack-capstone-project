import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api';

function MainPage() {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const fetchGifts = async () => {
            try {
                const { response, data } = await apiRequest('/api/gifts', { signal: controller.signal });
                if (!response.ok) {
                    throw new Error(`Unable to load gifts (HTTP ${response.status})`);
                }
                setGifts(data);
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
        fetchGifts();
        return () => controller.abort();
    }, []);

    return (
        <div className="container gift-page">
            <section className="text-center page-intro">
                <p className="eyebrow">Give well-loved things a new home</p>
                <h1>Find your next useful thing.</h1>
                <p className="lead">Discover household gifts shared by your community.</p>
                <Link className="btn btn-outline-primary" to="/search">Get started</Link>
            </section>
            <div className="d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
                <div>
                    <h2 className="h3 mb-1">Available gifts</h2>
                    <p className="text-muted mb-0">Browse items offered by the GiftLink community.</p>
                </div>
                <span className="text-muted">{!loading && !error ? `${gifts.length} gifts` : ''}</span>
            </div>
            {loading && <p role="status">Loading gifts…</p>}
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {!loading && !error && gifts.length === 0 && (
                <div className="alert alert-info">There are no gifts available yet.</div>
            )}
            <div className="row g-4">
                {gifts.map((gift) => (
                    <div className="col-sm-6 col-lg-4" key={gift.id}>
                        <article className="card product-card h-100">
                            {gift.image ? (
                                <img className="gift-card-image" src={gift.image} alt={gift.name} />
                            ) : (
                                <div className="no-image-available" role="img" aria-label={`No image for ${gift.name}`}>
                                    Image unavailable
                                </div>
                            )}
                            <div className="card-body">
                                <div className="d-flex justify-content-between gap-2">
                                    <h3 className="card-title h5">{gift.name}</h3>
                                    <span className="badge text-bg-light align-self-start">{gift.category}</span>
                                </div>
                                <p className="card-text text-muted">{gift.condition}</p>
                                {gift.date_added && <p className="date-added small text-muted">Added {new Date(gift.date_added * 1000).toLocaleDateString()}</p>}
                                <Link to={`/gifts/${encodeURIComponent(gift.id)}`} className="btn btn-primary mt-auto">View details</Link>
                            </div>
                        </article>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MainPage;
