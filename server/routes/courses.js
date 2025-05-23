// routes/courses.js
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const db = require('../db');  // Assuming you're using MySQL

// Get all courses
router.get('/all', async (req, res) => {
    try {
        const [courses] = await db.query('SELECT * FROM courses');
        res.json(courses);  // Send courses as JSON
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// server/routes/courses.js
router.get('/:slug', async (req, res) => {
    try {
        const [courseRows] = await db.query('SELECT * FROM courses WHERE slug = ?', [req.params.slug]);
        if (courseRows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const course = courseRows[0];

        // Get lessons for this course
        const [lessonRows] = await db.query(
            'SELECT * FROM lessons WHERE course_id = ? ORDER BY module_id, id',
            [course.id]
        );

        // Group lessons by module
        const modulesMap = {};
        lessonRows.forEach(lesson => {
            if (!modulesMap[lesson.module_id]) {
                modulesMap[lesson.module_id] = {
                    id: lesson.module_id,
                    title: lesson.module_title,
                    lessons: []
                };
            }
            modulesMap[lesson.module_id].lessons.push({
                id: lesson.id,
                title: lesson.title,
                type: lesson.type,
                duration: lesson.duration,
                completed: lesson.completed
            });
        });

        course.modules = Object.values(modulesMap);

        res.json(course);
    } catch (err) {
        console.error('Error fetching course:', err);
        res.status(500).json({ error: err.message });
    }
});

// Start a course
router.post('/:slug/start', auth, async (req, res) => {
    try {
        const slug = req.params.slug;
        const userId = req.user.id;

        // Get course ID from slug
        const [courseRows] = await db.query('SELECT id FROM courses WHERE slug = ?', [slug]);
        if (courseRows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const courseId = courseRows[0].id;

        // Check if user already started the course
        const [existing] = await db.query(
            'SELECT * FROM user_courses WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
        );

        if (existing.length > 0) {
            return res.status(200).json({ message: 'Course already started' });
        }

        // Insert into user_courses
        await db.query(
            'INSERT INTO user_courses (user_id, course_id, last_accessed) VALUES (?, ?, NOW())',
            [userId, courseId]
        );

        res.status(201).json({ message: 'Course started successfully' });
    } catch (err) {
        console.error('Error starting course:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Check if course is started by the user
router.get('/:slug/check-started', auth, async (req, res) => {
    try {
        // Get course ID from slug
        const [courseRows] = await db.query('SELECT id FROM courses WHERE slug = ?', [req.params.slug]);
        if (courseRows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        const courseId = courseRows[0].id;

        // Check user_courses
        const [rows] = await db.query(
            'SELECT * FROM user_courses WHERE user_id = ? AND course_id = ?',
            [req.user.id, courseId]
        );

        res.json({ started: rows.length > 0 });
    } catch (err) {
        console.error('Error checking if course is started:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Backend - In your courses.js route

router.get('/:slug/progress', auth, async (req, res) => {
    const courseSlug = req.params.slug;  // Get courseSlug from URL parameters
    const userId = req.user.id;  // Assuming you're using a middleware to get user ID
    try {
        // Query for courseId based on the courseSlug
        const result = await db.query('SELECT id FROM courses WHERE slug = ?', [courseSlug]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const courseId = result[0][0].id;
        const [course_started, _] = await db.query('SELECT user_id FROM user_courses WHERE course_id = ? AND user_id = ?', [courseId, userId]);
        // console.log(course_started);
        if (course_started.length === 0) {
            return res.status(404).json({ message: 'Course not started by this user.' });
        }
        // Fetch user's progress for the course
        const [rows] = await db.query(
            'SELECT finished_lessons, completed_lesson_ids FROM user_courses WHERE course_id = ? AND user_id = ?',
            [courseId, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Progress not found' });
        }

        const { finished_lessons, completed_lesson_ids } = rows[0];

        // Query for total lessons in the course
        const [courseRows] = await db.query(
            'SELECT total_lessons FROM courses WHERE id = ?',
            [courseId]
        );

        if (!courseRows.length) {
            return res.status(404).json({ message: 'Course data not found' });
        }

        const total_lessons = courseRows[0].total_lessons;

        res.setHeader('Cache-Control', 'no-store'); // Disable caching for this API endpoint
        // Send back the progress data
        res.json({
            finishedLessons: finished_lessons,
            totalLessons: total_lessons
        });

    } catch (error) {
        console.error('Error occurred:', error.message);
        res.status(500).json({ message: 'Failed to fetch progress', error: error.message });
    }
});
module.exports = router;
