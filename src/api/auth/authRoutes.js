const express = require('express');
const authController = require('./authController');
const router = express.Router();

// POST /api/auth/signup (registrasi pengguna baru)
router.post('/signup', authController.registerUser);

// POST /api/auth/signin (masuk pengguna)
router.post('/signin', authController.loginUser);

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
