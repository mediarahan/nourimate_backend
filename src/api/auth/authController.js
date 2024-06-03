const jwt = require('jsonwebtoken');
const Auth = require('../../models/Auth');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const serviceAccount = require('../../config/service-account-file.json');
const bcrypt = require('bcryptjs');

// Memuat variabel lingkungan dari file .env
dotenv.config();

// Mengganti dengan kunci rahasia JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Menginisialisasi Twilio
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// Inisialisasi Firebase Admin SDK untuk autentikasi Google
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Fungsi untuk mendaftarkan pengguna baru
exports.signupUser = async (req, res) => {
  const {name, email, password, phoneNumber} = req.body;

  let firebaseUser;

  try {
    // Membuat pengguna di Firebase
    firebaseUser = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
      disabled: false,
    });

    // Menyimpan pengguna di database lokal
    const {userId} = await Auth.registerUser(
      name,
      email,
      password,
      phoneNumber,
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId,
      firebaseUid: firebaseUser.uid,
    });
  } catch (err) {
    // Jika ada kesalahan saat membuat pengguna di database lokal, hapus pengguna di Firebase
    if (firebaseUser) {
      await admin.auth().deleteUser(firebaseUser.uid);
    }

    res.status(500).json({
      error: 'Error registering user',
      details: err.message + 'from' + err.stack,
    });
  }
};

// Fungsi untuk mengubah kata sandi pengguna
exports.changePassword = async (req, res) => {
  const {user_id, password} = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await Auth.updatePassword(user_id, hashedPassword);
    res.status(200).json({message: 'Password updated successfully'});
  } catch (error) {
    res.status(500).json({message: 'Error updating password'});
  }
};

// Fungsi untuk mengubah nomor telepon pengguna
exports.changePhoneNumber = async (req, res) => {
  const {user_id, phoneNumber} = req.body;
  try {
    await Auth.updatePhoneNumber(user_id, phoneNumber);
    res.status(200).json({message: 'Phone number updated successfully'});
  } catch (error) {
    res.status(500).json({message: 'Error updating phone number'});
  }
};

// Fungsi untuk masuk pengguna
exports.signinUser = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await Auth.loginUser(email, password);

    // Menghasilkan token akses dan token penyegaran JWT
    const accessToken = jwt.sign({userId: user.user_id}, JWT_SECRET, {
      expiresIn: '1d',
    });
    const refreshToken = jwt.sign({userId: user.user_id}, JWT_SECRET, {
      expiresIn: '7d',
    });

    // Menyimpan token baru di database
    await Auth.updateTokens(user.user_id, accessToken, refreshToken);

    // Menghapus kata sandi dari data pengguna yang akan dikembalikan
    delete user.password;

    // Mengembalikan token dan data pengguna
    res.json({
      accessToken,
      refreshToken,
      user,
    });
  } catch (err) {
    res.status(401).json({
      error: 'Authentication failed',
      details: err.message,
    });
  }
};

//Fungsi untuk meminta pengaturan ulang kata sandi
exports.requestPasswordReset = async (req, res) => {
  const {email} = req.body;

  try {
    const user = await Auth.findUserByEmail(email);
    if (!user) {
      return res.status(404).send('No user found with that email address.');
    }

    const accessToken = jwt.sign({userId: user.user_id}, JWT_SECRET, {
      expiresIn: '1d',
    });
    const refreshToken = jwt.sign({userId: user.user_id}, JWT_SECRET, {
      expiresIn: '7d',
    });

    await Auth.updateTokens(user.user_id, accessToken, refreshToken);

    // Mengirimkan tautan pengaturan ulang kata sandi melalui email
    const resetLink = `http://localhost:3000/reset-password?token=${accessToken}`;
    await admin
      .firestore()
      .collection('mail')
      .add({
        to: email,
        message: {
          from: `Your App <no-reply@your-app.com>`,
          subject: 'Password Reset Link',
          html: `
          <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
          <p>${accessToken}</p>
          `,
        },
      });

    res.send('Reset password link has been sent to your email.');
  } catch (error) {
    res.status(500).send('Error on the server.');
  }
};

// Fungsi untuk memverifikasi token pengaturan ulang kata sandi
exports.verifyResetPasswordToken = async (req, res) => {
  const {token} = req.params;
  const {email, password} = req.body;

  try {
    // Verifikasi validitas token menggunakan JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return res.status(401).send('Invalid token format.');
    }

    // Periksa apakah email dan token sesuai dengan yang ada di database
    const user = await Auth.verifyUserToken(email, token);
    if (!user) {
      return res.status(401).send('Invalid or expired reset token.');
    }

    // Meng-hash kata sandi baru
    const hashedPassword = await bcrypt.hash(password, 10);

    // Memperbarui kata sandi pengguna di database
    await Auth.updatePassword(decoded.userId, hashedPassword);

    res.send(
      'Your password has been successfully reset. You can now log in with the new password.',
    );
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send('Reset token has expired.');
    }
    res.status(500).send('Error processing your request.');
  }
};

// Fungsi untuk memvalidasi token
exports.validateToken = async (req, res) => {
  const {token} = req.params;

  try {
    // VVerifikasi validitas token menggunakan JWT
    jwt.verify(token, JWT_SECRET);

    // Periksa apakah token ada di database dan cocok dengan sesi aktif
    const tokenDetails = await Auth.getTokenDetails(token);
    if (!tokenDetails) {
      res.json({valid: false});
    } else {
      res.json({valid: true});
    }
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      res.json({valid: false});
    } else {
      res.status(500).send('Error processing your request.');
    }
  }
};

// Fungsi untuk mengirim verifikasi email
exports.sendEmailVerification = async (req, res) => {
  const {userId, email} = req.body;

  try {
    // Menghasilkan token 6-digit
    const token = Math.floor(100000 + Math.random() * 900000);

    // Menyimpan token di database lokal dengan referensi userId
    await Auth.updateEmailToken(userId, token);

    // Mengirim token melalui email menggunakan konfigurasi SMTP Firebase
    await admin
      .firestore()
      .collection('mail')
      .add({
        to: email,
        message: {
          from: `Your App <no-reply@your-app.com>`,
          subject: `Your Verification Code: ${token}`,
          html: `<p>Your verification code is ${token}</p>`,
        },
      })
      .then(() => console.log('Queued email for delivery!'));

    res.status(200).send({
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending email');
  }
};

// Fungsi untuk memverifikasi email
exports.verifyEmail = async (req, res) => {
  const {userId, emailToken} = req.body;

  try {
    const results = await Auth.verifyEmailToken(userId);
    if (results.length === 0 || results[0].emailToken !== emailToken) {
      res.status(400).send('Invalid email token');
    } else {
      await Auth.updateEmailVerified(userId);
      res.status(200).send('Email verified successfully');
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

// Fungsi untuk mengirim verifikasi nomor telepon
exports.sendPhoneVerification = async (req, res) => {
  const {userId, phoneNumber} = req.body;
  const smsToken = Math.floor(100000 + Math.random() * 900000);

  try {
    Auth.updateSmsToken(userId, smsToken);
    client.messages
      .create({
        body: `Your verification code is: ${smsToken}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+${phoneNumber}`,
      })
      .then((message) => {
        console.log(message.sid);
        res.status(200).send('Verification SMS sent');
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(`
          Error sending SMS
          ${err}
        `);
      });
  } catch (error) {
    res.status(500).send(error);
  }
};

// Fungsi untuk memverifikasi nomor telepon
exports.verifyPhone = async (req, res) => {
  const {userId, smsToken} = req.body;

  try {
    const results = await Auth.verifySmsToken(userId);
    if (results.length === 0 || results[0].smsToken !== smsToken) {
      res.status(400).send('Invalid SMS token');
    } else {
      await Auth.updatePhoneVerified(userId);
      res.status(200).send('Phone number verified successfully');
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

// Fungsi untuk mengirim token verifikasi ID google
exports.googleVerifyToken = async (req, res) => {
  const {id_token} = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(id_token);
    res.send({
      status: 'success',
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    });
  } catch (error) {
    res.status(401).send({status: 'error', message: error.message});
  }
};

// Fungsi untuk membuat token kustom baru untuk pengguna
exports.refreshToken = async (req, res) => {
  const {uid} = req.body;
  try {
    admin
      .auth()
      .createCustomToken(uid)
      .then((customToken) => {
        res.json({customToken});
      })
      .catch((error) => {
        console.log('Error creating custom token:', error);
      });
  } catch (err) {
    res.status(401).json({
      error: 'Invalid refresh token',
      details: err.message,
    });
  }
};

// Fungsi untuk mengupdate informasi pengguna google di database lokal
exports.googleUpdateUser = async (req, res) => {
  const {uid, name, phoneNumber} = req.body;
  try {
    const result = await Auth.updateGoogleUser(uid, name, phoneNumber);

    if (result && result.affectedRows > 0) {
      res.status(201).json({message: 'New user created successfully'});
    } else {
      res.status(200).json({message: 'User already exists'});
    }
  } catch (err) {
    res.status(500).json({
      error: 'Error updating user',
      details: err.message,
    });
  }
};
