const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Memuat variabel lingkungan
dotenv.config();

// Mendefinisikan fungsi middleware verifyToken
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({error: 'No token provided'});
  }

  try {
    // Memverifikasi token menggunakan jwt.verify dengan kunci rahasia JWT yang diambil dari variabel lingkungan (process.env.JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({error: 'Invalid or expired token'});
  }
};

// Mengekspor fungsi middleware verifyToken
module.exports = verifyToken;
