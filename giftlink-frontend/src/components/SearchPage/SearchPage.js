import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../api';
import './SearchPage.css';

const categories = ['Living', 'Bedroom', 'Bathroom', 'Kitchen', 'Office'];
const conditions = ['New', 'Like New', 'Older'];

function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        name: searchParams.get('name') || '',
        category: searchParams.get('category') || '',
        condition: searchParams.get('condition') || '',
        age_years: searchParams.get('age_years') || '100',
    });
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const fetchGifts = async () => {
            setLoading(true);
            setError('');
            try {
                const { response, data } = await apiRequest(`/api/gifts/search?${searchParams.toString()}`, {
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error(`Search failed (HTTP ${response.status})`);
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
    }, [searchParams]);

    const updateFilter = (event) => {
        setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const submitSearch = (event) => {
        event.preventDefault();
        const params = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value && !(key === 'age_years' && value === '100')) {
                params[key] = value;
            }
        });
        setSearchParams(params);
    };

    const clearSearch = () => {
        setFilters({ name: '', category: '', condition: '', age_years: '100' });
        setSearchParams({});
    };

    return (
        <div className="container gift-page">
            <h1 className="h2 mb-4">Search gifts</h1>
            <form className="filter-section card card-body mb-4" onSubmit={submitSearch}>
                <div className="row g-3 align-items-end">
                    <div className="col-12 col-md-6">
                        <label htmlFor="name" className="form-label">Name</label>
                        <input id="name" name="name" className="form-control search-input" value={filters.name} onChange={updateFilter} placeholder="Try “lamp”" />
                    </div>
                    <div className="col-12 col-md-3">
                        <label htmlFor="category" className="form-label">Category</label>
                        <select id="category" name="category" className="form-select dropdown-filter" value={filters.category} onChange={updateFilter}>
                            <option value="">All categories</option>
                            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                        </select>
                    </div>
                    <div className="col-12 col-md-3">
                        <label htmlFor="condition" className="form-label">Condition</label>
                        <select id="condition" name="condition" className="form-select dropdown-filter" value={filters.condition} onChange={updateFilter}>
                            <option value="">Any condition</option>
                            {conditions.map((condition) => <option key={condition} value={condition}>{condition}</option>)}
                        </select>
                    </div>
                    <div className="col-12 col-md-8">
                        <label htmlFor="age_years" className="form-label">Maximum age: {filters.age_years} years</label>
                        <input id="age_years" name="age_years" className="form-range age-range-slider" type="range" min="0" max="100" value={filters.age_years} onChange={updateFilter} />
                    </div>
                    <div className="col-12 col-md-4 d-flex gap-2">
                        <button className="btn btn-primary search-button flex-grow-1" type="submit">Search</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={clearSearch}>Clear</button>
                    </div>
                </div>
            </form>
            {loading && <p role="status">Searching gifts…</p>}
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {!loading && !error && gifts.length === 0 && <div className="alert alert-info">No gifts match these filters.</div>}
            <div className="row g-4">
                {gifts.map((gift) => (
                    <div className="col-sm-6 col-lg-4" key={gift.id}>
                        <article className="card search-results-card h-100">
                            {gift.image ? <img className="gift-card-image" src={gift.image} alt={gift.name} /> : <div className="no-image-available">Image unavailable</div>}
                            <div className="card-body">
                                <h2 className="card-title h5">{gift.name}</h2>
                                <p className="card-text">{gift.category} · {gift.condition}</p>
                                <Link className="btn btn-primary mt-auto" to={`/gifts/${encodeURIComponent(gift.id)}`}>View details</Link>
                            </div>
                        </article>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SearchPage;
