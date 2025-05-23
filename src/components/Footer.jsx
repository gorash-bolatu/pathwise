import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Footer.css';
import {Link} from "react-router-dom";

const Footer = () => {
    return (<div className="footer">
            <div className="footer-dark">
                <footer>
                    <div className="container">
                        <div className="row text-start">
                            <div className="col-sm-6 col-md-3 item">
                                <h3>PathWise</h3>
                                <ul>
                                    <li><Link to="/about">About Us</Link></li>
                                    <li><Link to="/about">Our Team</Link></li>
                                    <li><Link to="/about">Contact</Link></li>
                                </ul>
                            </div>
                            <div className="col-sm-6 col-md-3 item">
                                <h3>Platform</h3>
                                <ul>
                                    <li><Link to="/courses">Courses</Link></li>
                                    <li><Link to="/dashboard">Dashboard</Link></li>
                                    <li><Link to="/signup">Join Now</Link></li>
                                </ul>
                            </div>
                            <div className="col-md-6 item text">
                                <h3>Empowering Personalized Learning</h3>
                                <p>
                                    PathWise is a prototype of an interactive online learning platform designed for
                                    final-year coursework in computer science. It applies modern UX principles, adaptive
                                    learning paths, and interactivity to address gaps in traditional e-learning systems.
                                </p>
                            </div>
                        </div>
                        <p className="copyright">PathWise © 2025</p>
                        <p className="copyright">Built by: Lyailya Abdrakhmanova — Computer Science</p>
                    </div>
                </footer>
            </div>
    </div>);
};

export default Footer;
