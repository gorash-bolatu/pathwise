import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import SpellingGame from '../components/games/spelling/SpellingGame.tsx';

const LessonPage = () => {
    const { lessonId } = useParams();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameFinished, setGameFinished] = useState(false);
    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5000/api/lessons/${lessonId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) throw new Error('Failed to fetch lesson');

                const data = await res.json();
                // console.log("Lesson loaded:", data);
                setLesson(data);
            } catch (err) {
                console.error(err);
                setError('Could not load lesson.');
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [lessonId]);

    if (loading) return <div className="container py-5">Loading lesson...</div>;
    if (error || !lesson) return <div className="container text-danger py-5">{error || 'Lesson not found'}</div>;
    // console.log("Game type:", lesson.game_type);
    // console.log("Game content:", lesson.game_content);

    const handleGameComplete = (result) => {
        console.log('Game finished with result:', result);
        setGameFinished(true);  // You decide what to do here
    };

    return (
        <>
            <Header />
            <div className="container py-4">
                <h2>{lesson.title}</h2>
                <p><strong>Type:</strong> {lesson.type}</p>
                <p><strong>Duration:</strong> {lesson.duration}</p>
                {lesson.type === 'game' && (
                    <>
                        {lesson.game_type === 'spelling' && lesson.game_content?.word_list && (
                            <SpellingGame
                                data={lesson.game_content}
                                onComplete={(results) => handleGameComplete(true)}
                            />
                        )}

                        {gameFinished && (
                            <>
                                {lesson.nextLessonId ? (
                                    <Link to={`/lesson/${lesson.nextLessonId}`} className="btn btn-primary mt-4">
                                        Next Lesson →
                                    </Link>
                                ) : (
                                    <div className="alert alert-success mt-4">
                                        🎉 Congratulations! You've completed the course.
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}


            </div>
        </>
    );
};

export default LessonPage;
