/* eslint-disable */
// db.js
// Using mysql2/promise
const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Adjust as needed
    queueLimit: 0,
});

// Use async/await with the promise-based query method
async function testConnection() {
    try {
        const [rows, fields] = await db.query('SELECT 1'); // Simple query to check the connection
        console.log('Connected to the MySQL database.');
    } catch (err) {
        console.error('Database connection failed: ', err);
    }
}

testConnection();

module.exports = db;
