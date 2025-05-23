import React, { useState, useEffect } from 'react';

const apiUrl = import.meta.env.VITE_API_URL;
const ProgressBar = ({ courseSlug }) => {
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');
    const [hasStarted, setHasStarted] = useState(false); // State to track if course is started

    useEffect(() => {
        const fetchProgress = async () => {
            try {

                const response = await fetch(`${apiUrl}/courses/${courseSlug}/progress`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Include the token if needed
                    },
                });
                // Check if response is OK (status 200)
                if (!response.ok) {
                    const errorMessage = await response.text();
                    setError("Error fetching progress: " + errorMessage);
                    return;
                }

                // Try to parse response as JSON
                let data;
                try {
                    data = await response.json();
                } catch (e) {
                    console.error("Error parsing JSON:", e);
                    setError("Error parsing JSON response.");
                    return;
                }
                if (data.message === 'Course not started by this user.') {
                    setHasStarted(false); // Set to false if course hasn't started
                    return;
                }
                    setHasStarted(true); // Set to true if course has started
                    const { finishedLessons, totalLessons } = data;
                    const progressPercentage = (finishedLessons / totalLessons) * 100;
                    setProgress(progressPercentage);


            } catch (err) {
                console.error("Error:", err);
                setError('Error fetching progress');
            }
        };


        fetchProgress();
    }, [courseSlug, token]);

    if (!hasStarted) {
        return; // Show a message or return null to prevent rendering
    }

    return (
        <div>
            <div className="progress" style={{ height: '30px' }}>
                <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                >
                    {progress.toFixed(0)}%
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
