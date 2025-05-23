import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Home from "./pages/Home.jsx";
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from "./pages/About";
import CourseExplorer from "./pages/CourseExplorer";
import CoursePage from "./pages/CoursePage";
import LessonPage from "./pages/LessonPage";

function App() {
    return (
        <>
            <HelmetProvider>
                <div>
                    <Helmet>
                        <meta charSet="utf-8"/>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                    </Helmet>
                </div>
                <Router basename="/">
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/courses" element={<CourseExplorer />} />
                        <Route path="/course/:courseSlug" element={<CoursePage />} />
                        <Route path="/course/:courseSlug/lesson/:lessonId" element={<LessonPage />} />
                    </Routes>
                </Router>
            </HelmetProvider>
        </>
    );
}

export default App;
