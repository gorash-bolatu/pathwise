import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import {Helmet} from "react-helmet";
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';

function Home() {
    const [isSignUp, setIsSignUp] = useState(true); // Default to Sign Up
    const navigate = useNavigate();

    const handleGetStartedClick = () => {
        // Navigate to the appropriate route based on the current state
        if (isSignUp) {
            navigate('/signup');
        } else {
            navigate('/login');
        }
    };
    console.log("132354345563");

    return (
        <>
            <Helmet>
                <title>PathWise Home</title>
            </Helmet>
            <div className="home">
                <Header/>
                {/* Hero Section */}
                <header className="bg-light text-dark py-5 hero fade-in">
                    <div className="container text-start">
                        <h1 className="display-4 hero-title">Personalized Learning for Everyone</h1>
                        <p className="lead hero-description">Adaptive, engaging, and interactive online education
                            tailored to you.</p>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleGetStartedClick}
                        >
                            Get Started
                        </button>
                    </div>
                </header>

                {/* Features Section */}
                <section className="py-5 features fade-in">
                    <div className="container">
                        <div className="row text-center">
                            <div className="col-md-4 mb-4 feature fade-in">
                                <h4>📚 Smart Courses</h4>
                                <p>AI-powered content tailored to your pace and progress.</p>
                            </div>
                            <div className="col-md-4 mb-4 feature fade-in">
                                <h4>🎮 Gamified Learning</h4>
                                <p>Level up your knowledge and earn achievements as you go.</p>
                            </div>
                            <div className="col-md-4 mb-4 feature fade-in">
                                <h4>📊 Progress Tracking</h4>
                                <p>Visualize your growth and stay on track with data-driven insights.</p>
                            </div>
                        </div>

                    </div>
                    <Link to="/about" className="btn btn-primary btn-lg">Learn More</Link>
                </section>

                {/* How It Works Section */}
                <section className="py-5 bg-light">
                    <div className="container text-center">
                        <h2 className="section-title step fade-in">Your Journey in 3 Steps</h2>
                        <div className="row">
                            <div className="col-md-4 mb-4 step fade-in">
                                <h4>Step 1: Create Your Profile</h4>
                                <p>Set up your profile to get started on your learning journey.</p>
                            </div>
                            <div className="col-md-4 mb-4 step fade-in">
                                <h4>Step 2: Choose Your Interests</h4>
                                <p>Pick the topics that matter most to you, and we’ll tailor the path accordingly.</p>
                            </div>
                            <div className="col-md-4 mb-4 step fade-in">
                                <h4>Step 3: Start Learning</h4>
                                <p>Embark on a personalized learning experience that adapts as you go.</p>
                            </div>
                        </div>
                    </div>
                </section>


                <Footer/>
            </div>
        </>
    );
}

export default Home;
