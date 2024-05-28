const mysql = require('mysql2');
const dotenv = require('dotenv');

// memuat variabel
dotenv.config();

// membuat pool koneksi
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// untuk mengizinkan penggunaan async/await
const promisePool = pool.promise();

module.exports = promisePool;
