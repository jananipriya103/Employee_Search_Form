// server.js
const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to serve static files (for CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Replace with your actual MySQL password
  database: 'employee_db'
});

// Test the database connection
connection.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Route to display the search form
app.get('/', (req, res) => {
  res.render('index');
});

// Route to handle the search query
app.get('/search', (req, res) => {
  const employeeId = req.query.employeeId;
  if (!employeeId) {
    return res.render('result', { employee: null, error: 'Please provide an Employee ID.' });
  }

  // Use DATE_FORMAT to show only the date (YYYY-MM-DD) for dob and date_of_joining
  const sql = `
    SELECT
      id,
      name,
      DATE_FORMAT(dob, '%d-%m-%Y') AS dob,
      DATE_FORMAT(date_of_joining, '%d-%m-%Y') AS date_of_joining,
      phone,
      address,
      role
    FROM employees
    WHERE id = ?
  `;

  connection.query(sql, [employeeId], (err, results) => {
    if (err) {
      console.error(err);
      return res.render('result', { employee: null, error: 'Database query error.' });
    }
    if (!results || results.length === 0) {
      return res.render('result', { employee: null, error: 'No employee found with the given ID.' });
    }

    // Pass the first matching employee record to the result template
    res.render('result', { employee: results[0], error: null });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
