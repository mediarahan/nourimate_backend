const mysql = require('mysql2');
const dotenv = require('dotenv');

// memuat variabel
dotenv.config();

// membuat pool koneksi
const pool = mysql.createPool({
  host: process.env.DB_HOST, // host database
  user: process.env.DB_USER, // pengguna database
  password: process.env.DB_PASSWORD, //kata sandi database
  database: process.env.DB_NAME, //nama database
  waitForConnections: true, // menunggu koneksi tersedia jika diperlukan
  connectionLimit: 10, // batasan jumlah koneksi dalam pool
  queueLimit: 0, // batasan antrian untuk koneksi (0 = tidak terbatas)
});

// untuk mengizinkan penggunaan async/await
const promisePool = pool.promise();

module.exports = promisePool;
