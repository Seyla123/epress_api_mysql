const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

dotenv.config(); // Load environment variables

const app = express();
app.use(bodyParser.json()); // Middleware to parse JSON request bodies
app.use(express.static('public')); // Serve static files from the public directory

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10, // Connection pool limit
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.code, err.message);
    return;
  }
  console.log('Connected to MySQL database!');
  connection.release(); // Release the connection back to the pool
});

// Endpoint to retrieve data from the Class table
app.get('/', (req, res) => {
  res.send('Welcome to the Class API! Use /create-class to add a new class.');
});

// Serve the HTML form for creating a new class
app.get('/create-class', (req, res) => {
  res.sendFile(__dirname + '/public/create-class.html');
});

// API endpoint to insert data into the Class table
app.post('/classes', (req, res) => {
  const { class_name } = req.body;

  if (!class_name) {
    return res.status(400).json({ error: 'class_name is required' });
  }
  const query = 'INSERT INTO Class (class_name) VALUES (?)';
  pool.query(query, [class_name], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.status(201).json({ message: 'Class created', id: result.insertId });
  });
});
app.get('/classes', (req, res) => {
  pool.query('SELECT * FROM Class', (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results);
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});