const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/lessons/:id
router.get('/:id', auth, async (req, res) => {
    const lessonId = req.params.id;

    try {
        const [rows] = await db.query('SELECT * FROM user_auth.lessons WHERE id = ?', [lessonId]);
        if (rows.length === 0) {
            return res.status(404).json({message: 'Lesson not found'});
        }

        const lesson = rows[0];

        // If the lesson is a spelling game and has game content
        if (lesson.game_type === 'spelling' && lesson.game_content_id) {
            const [words] = await db.query('SELECT word, hint FROM user_auth.spelling_words WHERE list_id = ?', [lesson.game_content_id]);
            lesson.game_content = {word_list: words};
        } else if (lesson.game_type === 'blank' && lesson.game_content_id) {
            const [rows] = await db.query('SELECT parts, word_list, correct_words FROM user_auth.blank_sentences WHERE list_id = ?', [lesson.game_content_id]);

            const sentence_list = rows.map(row => ({
                parts: typeof row.parts === 'string' ? JSON.parse(row.parts) : row.parts,
                wordList: typeof row.word_list === 'string' ? JSON.parse(row.word_list) : row.word_list,
                correctWords: typeof row.correct_words === 'string' ? JSON.parse(row.correct_words) : row.correct_words
            }));


            lesson.game_content = {sentence_list};
        } else if (lesson.game_type === 'sentence_building' && lesson.game_content_id) {
            const [rows] = await db.query('SELECT sentence_text FROM user_auth.sentence_building_content WHERE list_id = ?', [lesson.game_content_id]);

            const sentence_list = rows.map(row => ({
                sentence: typeof row.sentence_text === 'string' ? row.sentence_text.split(' ') // or a smarter tokenizer if needed
                    : row.sentence_text
            }));


            lesson.game_content = {sentence_list};
        }


        // 👉 Determine next lesson in the same module
        const [nextLessons] = await db.query('SELECT id FROM user_auth.lessons WHERE course_id = ? AND id > ? ORDER BY id ASC LIMIT 1', [lesson.course_id, lesson.id]);
        // console.log(lesson.course_id);
        // 👉 If no more lessons in module, find next module's first lesson
        let nextLessonId = null;
        if (nextLessons.length > 0) {
            nextLessonId = nextLessons[0].id;
        } else {
            const [nextModules] = await db.query('SELECT id FROM user_auth.lessons WHERE course_id = ? AND module_id > ? ORDER BY module_id ASC, id ASC LIMIT 1', [lesson.course_id, lesson.module_id]);
            if (nextModules.length > 0) {
                nextLessonId = nextModules[0].id;
            }
        }

        lesson.nextLessonId = nextLessonId; // ✅ <-- INSERT THIS LINE

        res.json(lesson);
    } catch (err) {
        console.error('Error fetching lesson:', err);
        res.status(500).json({message: 'Server error'});
    }
});

// Progress
router.patch('/update-progress',auth, async (req, res) => {
    const { courseSlug, lessonId } = req.body;
    const userId = req.user.id;  // Assuming the user is authenticated
    try {
        // Fetch courseId and total_lessons using courseSlug
        const result = await db.query('SELECT id FROM courses WHERE slug = ?', [courseSlug]);


        if (result.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // console.log(courseSlug,result);
        const courseId = result[0][0].id;  // Course ID
        // Find the user's progress record for the course
        const [rows] = await db.query(
            'SELECT finished_lessons, completed_lesson_ids  FROM user_courses WHERE course_id = ? AND user_id = ?',
            [courseId, userId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Progress not found' });
        }

        let { finished_lessons, completed_lesson_ids } = rows[0];
        // console.log(finished_lessons, completed_lesson_ids);
        // Convert to array (assumes JSON array, fallback to empty)
        let completedLessons = [];
        try {
            completedLessons = JSON.parse(completed_lesson_ids || '[]');
        } catch (e) {
            completedLessons = [];
        }

        // Check if lessonId is already completed
        if (completedLessons.includes(lessonId)) {
            return;
        }
        completedLessons.push(lessonId);
        const [courseRows] = await db.query(
            'SELECT total_lessons FROM courses WHERE id = ?',
            [courseId]
        );

        if (!courseRows.length) {
            return res.status(404).json({ message: 'Progress or course not found' });
        }

        const total_lessons = courseRows[0].total_lessons;
        // Increment the finishedLessons
        finished_lessons += 1;

        // Ensure finishedLessons doesn't exceed totalLessons
        if (finished_lessons > total_lessons) {
            finished_lessons = total_lessons;
        }

        console.log(finished_lessons,courseId,userId);
        // Update the user's progress

        await db.query(
            'UPDATE user_courses SET finished_lessons = ?, completed_lesson_ids = ? WHERE course_id = ? AND user_id = ?',
            [finished_lessons, JSON.stringify(completedLessons), courseId, userId]
        );
        // Return the updated progress data
        res.json({
            finishedLessons: finished_lessons,
            totalLessons: total_lessons
        });

    } catch (error) {
        console.error('Error occurred:', error.message);
        res.status(500).json({ message: 'Failed to update progress', error: error.message });
    }
});

module.exports = router;
