import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaStar, FaUser, FaClock } from 'react-icons/fa';
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Link } from 'react-router-dom';
import {Helmet} from "react-helmet"; // Import Link for navigation

const apiUrl = import.meta.env.VITE_API_URL;
const CourseExplorer = () => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetch(`${apiUrl}/courses/all`)
            .then((response) => response.json())
            .then((data) => {
                setCourses(data);
            })
            .catch((err) => console.error('Error fetching courses:', err));
    }, []);

    return (
        <>
            <Helmet>
                <title>PathWise Courses</title>
            </Helmet>
            <Header />
            <div className="container mt-5 py-5">
                <h2 className="mb-4">Explore Courses</h2>
                <div className="row g-4">
                    {courses.map((course) => (
                        <div key={course.id} className="col-lg-4">
                            <Link to={`/course/${course.slug}`} className="text-decoration-none">
                                <div className="card h-100 shadow-sm p-3">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="text-start">
                                            <h5 className="fw-bold mb-1">{course.title}</h5>
                                            <small className="text-muted">{course.instructor || 0}</small>
                                        </div>
                                        <img
                                            src={course.thumbnail}
                                            alt="Course"
                                            style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px' }}
                                            className="img-thumbnail border-0"
                                        />
                                    </div>
                                    <div className="d-flex gap-3 align-items-center mt-auto pt-3">
                                        <span><FaStar className="text-warning" /> {course.rating}</span>
                                        <span><FaUser /> {course.students || 0}</span>
                                        <span><FaClock /> {course.duration}</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CourseExplorer;
