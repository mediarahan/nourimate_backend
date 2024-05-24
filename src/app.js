// app.js
const express = require('express');
const dotenv = require('dotenv');
const verifyToken = require('./middleware/auth');

// memuat variabel
dotenv.config();

// membuat aplikasi Express
const app = express();

// middleware untuk mem-parsing permintaan JSON
app.use(express.json());

// route root
app.get('/', (req, res) => {
  res.send('you are connected!!');
});

// Import routes
const authRoutes = require('./api/auth/authRoutes');
const userRoutes = require('./api/users/userRoutes');

// menggunakan rute-rute yang diimpor
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// GET /protected (protected route)
app.get('/protected', verifyToken, (req, res) => {
  res.json({
    message: `Hello, user with ID: ${req.user.userId}! You have accessed a protected route.`,
  });
});

// memulai server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
