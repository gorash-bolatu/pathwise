import React from 'react'
import './Header.css';
import useAuth from '../hooks/useAuth';
import {Link} from "react-router-dom";

const Header = () => {
    const user = useAuth();
    const handleLogout = () => {
        localStorage.removeItem('user'); // remove token or user data
        localStorage.removeItem('token'); // on logout
        window.location.href = '/'; // or use navigate('/') if using react-routes-dom
    };

    return (<div className="container">

        <nav className="navbar navbar-expand-lg">

            <a className="logo-button" href="/">
                <img src="/PathWiseLogo.jpg" alt="Logo" className="logo-img"/>
            </a>


            <div className="navbar-brand">
                <ul className="navbar-nav ">
                    <li className="nav-item">
                        <Link to="/" className="nav-link">HOME</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/courses" className="nav-link">COURSES</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/about" className="nav-link">ABOUT</Link>
                    </li>
                </ul>
            </div>
            <div className="ms-auto d-flex gap-2 align-items-start me-4 mt-2">
                {!user ? (
                    <>
                        <Link to="/login" className="btn btn-outline-primary">Login</Link>
                        <Link to="/signup" className="btn btn-primary">Sign Up</Link>
                    </>
                ) : (
                    <div className="dropdown">
                        <button className="btn btn-outline-secondary dropdown-toggle" type="button"
                                data-bs-toggle="dropdown" aria-expanded="false">
                            {user.name}
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li><a className="dropdown-item" href="/profile">Profile</a></li>
                            <li><a className="dropdown-item" href="/dashboard">Dashboard</a></li>
                            <li>
                                <hr className="dropdown-divider"/>
                            </li>
                            <li>
                                <button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button>
                            </li>
                        </ul>
                    </div>

                )}
            </div>
        </nav>
    </div>);
};

export default Header;