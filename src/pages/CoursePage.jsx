import React, { useEffect, useState } from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import Header from '../components/Header';
import './CoursePage.css';
import {Helmet} from "react-helmet";
import ProgressBar from '../components/ProgressBar';

const apiUrl = import.meta.env.VITE_API_URL;
const CoursePage = () => {
    const { courseSlug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [started, setStarted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await fetch(`${apiUrl}/courses/${courseSlug}`);
                if (!res.ok) throw new Error('Course fetch failed');
                const data = await res.json();
                setCourse(data);
            } catch (err) {
                console.error('Error fetching course:', err);
                setCourse(null);
            }
        };

        const checkStarted = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setStarted(false);
                setLoading(false); // ✅ required here
                return;
            }

            try {
                const res = await fetch(`${apiUrl}/courses/${courseSlug}/check-started`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (!res.ok) throw new Error('Check started failed');
                const data = await res.json();
                setStarted(data.started);
            } catch (err) {
                console.error('Error checking course status:', err);
                setStarted(false);
            } finally {
                setLoading(false); // ✅ Always run
            }
        };

        fetchCourse();
        checkStarted();
    }, [courseSlug]);



    const handleStart = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/courses/${courseSlug}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
            });

            if (res.ok) setStarted(true);
        } catch (err) {
            console.error('Failed to start course:', err);
        }
    };

    if (loading) {
        return <div className="container py-5">Loading...</div>;
    }

    if (!course) {
        return <div className="container py-5 text-danger">Course not found.</div>;
    }


    return (
        <>
            <Helmet>
                <title>PathWise - {course.title}</title>
            </Helmet>
            <Header />
            <div className="container py-4">
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="img-fluid mb-3 rounded"
                    style={{maxHeight: '300px'}}
                />

                <div className="course-details">
                    <div className="course-header">
                        <h2 className="course-title">{course.title}</h2>
                    </div>

                    <div className="course-info-container">
                        <div className="course-description">
                            <p>{course.description}</p>
                        </div>

                        <div className="course-meta">
                            <div className="meta-item">
                                <strong>Instructor:</strong>
                                <span>{course.instructor}</span>
                            </div>
                            <div className="meta-item">
                                <strong>Duration:</strong>
                                <span>{course.duration}</span>
                            </div>
                            <div className="meta-item">
                                <strong>Level:</strong>
                                <span className="badge-level">{course.level}</span>
                            </div>
                            <div className="meta-item">
                                <strong>Rating:</strong>
                                <span className="badge-rating">{course.rating}</span>
                            </div>
                            <div className="meta-item">
                                <strong>Students Enrolled:</strong>
                                <span>{course.students}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <ProgressBar courseSlug={courseSlug}/>
                {!started && (
                    <button className="btn btn-success mt-3" onClick={handleStart}>
                        Start Course
                    </button>
                )}

                <hr/>
                <h4 className="mt-4">Course Content</h4>
                <div className="accordion" id="courseModules">
                    {course.modules.map((module, index) => (
                        <div key={module.id} className="accordion-item">
                            <h2 className="accordion-header" id={`heading${index}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse${index}`}
                                    aria-expanded="false"
                                    aria-controls={`collapse${index}`}
                                >
                                    {module.title}
                                </button>
                            </h2>
                            <div
                                id={`collapse${index}`}
                                className="accordion-collapse collapse"
                                data-bs-parent="#courseModules"
                            >
                                <div className="accordion-body">
                                    <ul className="list-group">
                                        {module.lessons.map((lesson) => (
                                            <li
                                                key={lesson.id}
                                                className="list-group-item d-flex justify-content-between align-items-center"
                                            >
                                                {started ? (
                                                    <Link to={`/course/${courseSlug}/lesson/${lesson.id}`}>{lesson.title}</Link>
                                                ) : (
                                                    <span className="text-muted">{lesson.title}</span>
                                                )}
                                                <small className="text-secondary">{lesson.duration}</small>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default CoursePage;
