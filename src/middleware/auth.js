const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// memuat variabel
dotenv.config();

// untuk verifikasi token JWT
const verifyToken = (req, res, next) => {
  // mengambil header "Authorization" dari permintaan
  const authHeader = req.headers['authorization'];
  // mendapatkan token dari header "Authorization" jika ada
  const token = authHeader && authHeader.split(' ')[1];

  // jika tidak ada token yang diberikan, kirim respons dengan kode status 403
  if (!token) {
    return res.status(403).json({error: 'No token provided'});
  }

  try {
    // mendekode token menggunakan kunci rahasia JWT dari variabel
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // menyimpan data pengguna yang terdekripsi dalam objek permintaan (req)
    req.user = decoded;
    // melanjutkan ke fungsi selanjutnya dalam rantai middleware
    next();
  } catch (err) {
    // jika token tidak valid / kadaluwarsa, kirim respons dengan kode status 401
    return res.status(401).json({error: 'Invalid or expired token'});
  }
};

module.exports = verifyToken;
