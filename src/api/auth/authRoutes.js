const express = require('express');
const authController = require('./authController');
const authMiddleware = require('./authMiddleware');
const router = express.Router();

// POST /api/auth/signup (daftar pengguna baru)
router.post(
  '/signup',
  // Middleware untuk memvalidasi password sebelum melanjutkan
  authMiddleware.validatePassword,
  // Controller untuk mendaftarkan pengguna baru
  authController.signupUser,
);

// POST /api/auth/signin (login pengguna)
router.post('/signin', authController.signinUser);

// POST /api/auth/forgot-password
router.post('/forgot-password', authController.requestPasswordReset);

// POST /api/auth/reset-password/:token
router.post(
  '/reset-password/:token',
  // Middleware untuk memvalidasi password baru sebelum melanjutkan
  authMiddleware.validatePassword,
  // Controller untuk memverifikasi token reset password dan memperbarui password
  authController.verifyResetPasswordToken,
);

// GET /validate-token/:token
router.get('/validate-token/:token', authController.validateToken);

// POST /api/auth/change-password
router.post(
  '/change-password',
  // Middleware untuk memvalidasi password baru sebelum melanjutkan
  authMiddleware.validatePassword,
  // Controller untuk mengubah password pengguna
  authController.changePassword,
);

// POST /api/auth/change-phone-number
router.post('/change-phone-number', authController.changePhoneNumber);

// POST /api/auth/send-email-verification
router.post('/send-email-verification', authController.sendEmailVerification);

// POST /api/auth/verify-email
router.post('/verify-email', authController.verifyEmail);

// POST /api/auth/send-phone-verification
router.post('/send-phone-verification', authController.sendPhoneVerification);

// POST /api/auth/verify-phone
router.post('/verify-phone', authController.verifyPhone);

// POST /api/auth/google-verify-token
router.post('/google-verify-token', authController.googleVerifyToken);

// POST /api/auth/token
router.post('/token', authController.refreshToken);

// POST /api/auth/google-update-user
router.post('/google-update-user', authController.googleUpdateUser);

module.exports = router;
