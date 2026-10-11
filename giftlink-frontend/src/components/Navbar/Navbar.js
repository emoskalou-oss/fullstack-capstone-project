import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AuthContext';

export default function Navbar() {
    const { isLoggedIn, userName, logout } = useAppContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 px-md-5">
            <Link className="navbar-brand" to="/">GiftLink</Link>
            <div className="navbar-collapse">
                <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
                    <li className="nav-item"><NavLink className="nav-link" to="/">Gifts</NavLink></li>
                    <li className="nav-item"><NavLink className="nav-link" to="/search">Search</NavLink></li>
                    {isLoggedIn ? (
                        <>
                            <li className="nav-item"><NavLink className="nav-link" to="/gifts/new">Give a gift</NavLink></li>
                            <li className="nav-item"><NavLink className="nav-link" to="/profile">{userName || 'Profile'}</NavLink></li>
                            <li className="nav-item"><button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>Log out</button></li>
                        </>
                    ) : (
                        <>
                            <li className="nav-item"><NavLink className="nav-link" to="/login">Log in</NavLink></li>
                            <li className="nav-item"><Link className="btn btn-primary btn-sm" to="/register">Create account</Link></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}
