require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const lessonRoutes = require('./routes/lessons');

app.use('/api', authRoutes);
// Mount the courses route
app.use('/api/courses', coursesRoutes);
// Lessons route
app.use('/api/courses/:courseSlug/lessons', lessonRoutes);

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
