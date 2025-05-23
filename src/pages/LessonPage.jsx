import React, { useEffect, useState } from 'react';
import {useParams, Link, useLocation} from 'react-router-dom';
import Header from '../components/Header';
import SpellingGame from '../components/games/spelling/SpellingGame.tsx';
import BlankFillGame from "../components/games/blank/BlankFillGame.tsx";
import SentenceBuildingGame from "../components/games/sentenceBuilding/SentenceBuildingGame";
import {useNavigate} from "react-router-dom";
import ReactMarkdown from 'react-markdown'

const apiUrl = import.meta.env.VITE_API_URL;
const LessonPage = () => {
    const { courseSlug, lessonId } = useParams();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameFinished, setGameFinished] = useState(false);
    const navigate = useNavigate();
    console.log(gameFinished);

    const fetchLesson = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/courses/${courseSlug}/lessons/${lessonId}`, {
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
    useEffect(() => {
        fetchLesson();
    }, [lessonId]);
    useEffect(() => {
        return () => {
            setGameFinished(false);
        };
    }, [useLocation().pathname]);
    if (loading) return <div className="container py-5">Loading lesson...</div>;
    if (error || !lesson) return <div className="container text-danger py-5">{error || 'Lesson not found'}</div>;
    // console.log("Game type:", lesson.game_type === 'blank');
    // console.log("Game content:", lesson.game_content);console.log(
    //     'Should render blank game:',
    //     lesson.game_type === 'blank' && Array.isArray(lesson.game_content?.sentence_list)
    // );

    const handleFinishLesson = async () => {
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${apiUrl}/courses/${courseSlug}/lessons/update-progress`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    courseSlug,  // Send the courseSlug instead of courseId
                    lessonId,    // Optionally, include lessonId if needed
                })
            });

            if (!res.ok) {
                throw new Error('Failed to update progress');
            }

            const data = await res.json();
            // alert(`Progress updated to ${data.finishedLessons} out of ${data.allLessons} lessons`);
        } catch (err) {
            console.error(err);
            alert('Error saving progress');
        }
    };
    const handleGameComplete = async (result) => {
        console.log('Game finished with result:', result);
         handleFinishLesson();  // Wait for progress to update
        await fetchLesson();         // Re-fetch latest lesson info
        setGameFinished(true);       // Then show next lesson

    };

    const handleBackToCourse = () => {
        navigate(`/course/${courseSlug}`);  // Navigates to the previous page (previous history)
    };

    return (
        <>
            <Header />
            <div className="container py-4">
                <h2>{lesson.title}</h2>
                <p><strong>Type:</strong> {lesson.type}</p>
                <p><strong>Duration:</strong> {lesson.duration}</p>
                <div>
                    <div className="lesson-text">
                        {/* Render the markdown content */}
                        <ReactMarkdown>{lesson.lesson_text}</ReactMarkdown>
                    </div>
                    {/* You can continue to render the game components here */}
                </div>
                {lesson.type === 'game' && (
                    <>
                        {lesson.game_type === 'spelling' && lesson.game_content?.word_list && (
                            <SpellingGame
                                data={lesson.game_content}
                                onComplete={(results) => handleGameComplete(true)}
                            />
                        )}
                        {lesson.game_type === 'blank' && lesson.game_content?.sentence_list && (
                            <BlankFillGame
                                data={lesson.game_content}
                                settings={{difficulty: "normal"}}
                                onComplete={(results) => handleGameComplete(true)}
                            />
                        )}
                        {lesson.game_type === 'sentence_building' && lesson.game_content?.sentence_list && (
                            <SentenceBuildingGame
                                data={lesson.game_content}
                                settings={{difficulty: "normal"}}
                                onComplete={(results) => handleGameComplete(true)}
                            />
                        )}
                        {gameFinished && (
                            <>
                                {lesson.nextLessonId ? (
                                    <Link to={`/course/${courseSlug}/lesson/${lesson.nextLessonId}`}
                                          className="btn btn-primary mt-4">
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
                {/* Go back to course button */}
                <br/>
                <Link to={`/course/${courseSlug}`} className="btn btn-primary mt-4">
                    Go to Courses
                </Link>

            </div>
        </>
    );
};

export default LessonPage;
