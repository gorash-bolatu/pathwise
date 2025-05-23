import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import {Helmet} from 'react-helmet';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import React from 'react';

function About() {
    return (<>
            <Helmet>
                <title>About PathWise</title>
            </Helmet>
            <div className="about">
                <Header/>

                {/* Hero Section */}
                <section
                    className="bg-light text-dark py-5 hero fade-in"
                    style={{animationDelay: '0s'}}
                >
                    <div className="container text-start">
                        <h1 className="display-4 hero-title">What is PathWise?</h1>
                        <p className="lead hero-description">
                            PathWise is an adaptive e-learning platform that delivers customized learning experiences
                            through intelligent content sequencing, interactive feedback, and progress-driven pathways.
                            Designed with both usability and educational theory in mind, PathWise empowers learners to
                            take control of their journey—maximizing retention, engagement, and success.
                        </p>
                    </div>
                </section>

                {/* Why It Was Built */}
                <section
                    className="py-5 features fade-in"
                    style={{animationDelay: '0.5s'}}
                >
                    <div className="container">
                        <h2 className="section-title text-center mb-5">Why PathWise Was Built</h2>
                        <div className="row text-center">
                            <div className="col-md-4 mb-4">
                                <h4>📉 Static Learning</h4>
                                <p>Most platforms deliver the same content to everyone, regardless of skill or pace.</p>
                            </div>
                            <div className="col-md-4 mb-4">
                                <h4>🧠 Low Engagement</h4>
                                <p>Lack of interactivity and personalization often leads to poor learning outcomes.</p>
                            </div>
                            <div className="col-md-4 mb-4">
                                <h4>🎯 One-Size-Fits-All</h4>
                                <p>PathWise was created to offer smarter, adaptive learning for each unique user.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What Makes It Different */}
                <section
                    className="py-5 bg-light fade-in"
                    style={{animationDelay: '2s'}}
                >
                    <div className="container text-center fade-in step">
                        <h2 className="section-title mb-5">What Makes PathWise Unique</h2>
                        <div className="row">
                            <div className="col-md-3 mb-4">
                                <h5>📚 Personalized Paths</h5>
                                <p>Adapts content to your pace, performance, and goals.</p>
                            </div>
                            <div className="col-md-3 mb-4">
                                <h5>🧩 Interactive Learning</h5>
                                <p>Quizzes, feedback, and gamified tools keep you engaged.</p>
                            </div>
                            <div className="col-md-3 mb-4">
                                <h5>📈 Progress Awareness</h5>
                                <p>Track your achievements and get smart content suggestions.</p>
                            </div>
                            <div className="col-md-3 mb-4">
                                <h5>📱 Simple & Accessible</h5>
                                <p>Clean, responsive design that works across all devices.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Creator Section */}
                <section
                    className="py-5"
                >
                    <div className="container text-start">
                        <h2 className="section-title">Who Made PathWise</h2>
                        <p><strong>Lyailya Abdrakhmanova</strong><br/>
                            Final-year Computer Science student
                        </p>
                        <p>
                            “PathWise is the result of a year-long thesis project and a long-standing passion for
                            education, design, and human-centered technology.”
                        </p>
                    </div>
                </section>

                {/* Acknowledgments */}
                <section
                    className="py-5 bg-light"
                >
                    <div className="container text-start">
                        <h2 className="section-title">Acknowledgments</h2>
                        <ul>
                            <li>Shaoxing University, for supporting independent research</li>
                            <li>Inspirations: Coursera, Duolingo, Khan Academy</li>
                            <li>Thanks to all friends and peers who gave feedback and encouragement</li>
                        </ul>
                    </div>
                </section>

                <Footer/>
            </div>
        </>);
}

export default About;
