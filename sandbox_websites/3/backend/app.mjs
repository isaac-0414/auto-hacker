import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import path from 'path'
import cors from "cors";
import { fileURLToPath } from 'url';

// Fix issue of ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const port = 8080;

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Parse application/json
app.use(bodyParser.json());

const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions))

// // Host static page
// app.use(express.static(path.join(__dirname, 'public')));

/* MySQL setup (change these details to your database configuration) */

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Zzh20140712@'
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
  const createDatabaseQuery = 'CREATE DATABASE IF NOT EXISTS testdb3';
  const useDatabaseQuery = 'USE testdb3';
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(100) UNIQUE,
      password VARCHAR(100),
      PRIMARY KEY (id)
    )`;

  const insertDataQuery = `
    INSERT IGNORE INTO users (name, password) VALUES
    ('alice', 'alice123'),
    ('bob', 'bob123'),
    ('isaac', 'zzh123')
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

app.post('/login', (req, res) => {
  var username = req.body.username; // a valid username is alice
  var password = req.body.password; // a valid password is alice123
  var query = "SELECT name FROM users where name = '" + username + "' and password = '" + password + "'";

  console.log("username: " + username);
  console.log("password: " + password);
  console.log('query: ' + query);
  
  db.query(query , (err, row) => {
      if(err) {
          console.log('ERROR', err);
          res.json({error: err})
      } else if (!row || row.length === 0) {
          console.log({unauthorize: true})
          res.json({unauthorize: true})
      } else {
          console.log({username: row[0].name})
          res.json({username: row[0].name});
      }
  });

});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});