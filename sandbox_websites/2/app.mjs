import express from 'express';
import mysql from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix issue of ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Host static page
app.use(express.static(path.join(__dirname, 'public')));

/* MySQL setup (change these details to your database configuration) */
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zzh20140712@',
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }

  console.log('Connected to database.');
  // Initialize the database
  initializeDatabase();
});

// Function to initialize the database and table
function initializeDatabase() {
  const createDatabaseQuery = 'CREATE DATABASE IF NOT EXISTS testdb2';
  const useDatabaseQuery = 'USE testdb2';
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(100) UNIQUE,
      email VARCHAR(100),
      PRIMARY KEY (id)
    )`;

  const insertDataQuery = `
    INSERT IGNORE INTO users (name, email) VALUES
    ('alice', 'alice@example.com'),
    ('bob', 'bob@example.com')
    ON DUPLICATE KEY UPDATE id=id;`;

  db.query(createDatabaseQuery, err => {
    if (err) {
      console.error('Failed to create database:', err.stack);
      return;
    }
    console.log('Database created or already exists.');

    db.query(useDatabaseQuery, err => {
      if (err) {
        console.error('Failed to switch to database:', err.stack);
        return;
      }
      console.log('Switched to database.');

      db.query(createTableQuery, err => {
        if (err) {
          console.error('Failed to create table:', err.stack);
          return;
        }
        console.log('Table created or already exists.');

        db.query(insertDataQuery, err => {
          if (err) {
            console.error('Failed to insert data into table:', err.stack);
            return;
          }
          console.log('Initial data inserted into table.');

        });
      });
    });
  });
}



/* Endpoints */
app.get('/user', (req, res) => {
  const userId = req.query.id; // vulnerable to SQL injection
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  console.log('query: ' + query);
  db.query(query, (err, rows) => {
    if (err) {
      console.log('ERROR', err);
      res.status(500).send('An error occurred');
    } else if (!rows || rows.length === 0) {
      res.status(404).send('User not found');
    } else {
      res.json(rows[0]);
    }
  });
});


app.get((req, res) => {
  res.status(404);
  res.send('<h1>Error 404: Resource not found</h1>');
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});