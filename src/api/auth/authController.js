const jwt = require('jsonwebtoken');
const Auth = require('../../models/Auth');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');
const serviceAccount = require('../../config/service-account-file.json');

// Memuat variabel
dotenv.config();

// Mengganti dengan kunci rahasia JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// twilio
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// verifikasi email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// google auth mobile
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// untuk mendaftarkan pengguna baru
exports.signupUser = async (req, res) => {
  const {name, email, password, phoneNumber} = req.body;

  try {
    // memanggil metode registerUser dari model Auth untuk mendaftarkan pengguna baru
    const {userId} = await Auth.registerUser(
      name,
      email,
      password,
      phoneNumber,
    );

    res.status(201).json({
      message: 'User registered successfully',
      userId,
    });
  } catch (err) {
    res.status(500).json({
      error: 'Error registering user',
      details: err.message,
    });
  }
};

// untuk login pengguna
exports.signinUser = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await Auth.loginUser(email, password);

    // membuat access token JWT dan refresh token
    const accessToken = jwt.sign({userId: user.user_id}, JWT_SECRET, {
      expiresIn: '1h',
    });
    const refreshToken = jwt.sign({userId: user.user_id}, JWT_SECRET, {
      expiresIn: '7d',
    });

    // meyimpan token baru dalam database
    await Auth.updateTokens(user.user_id, accessToken, refreshToken);

    // clg
    // console.log('user', user); remove password from user object
    delete user.password;

    console.log('user', user);

    // menanggapi token
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

// untuk mengirim email verifikasi
exports.sendEmailVerification = async (req, res) => {
  const {userId, email} = req.body;
  const emailToken = Math.floor(100000 + Math.random() * 900000);

  try {
    await Auth.updateEmailToken(userId, emailToken);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      text: `Your verification code is: ${emailToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send('Error sending email');
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send('Verification email sent');
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

// untuk memverifikasi email
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

// untuk mengirim verifikasi nomor telepon
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

// untuk memverifikasi nomor telepon
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

// untuk memverifikasi token google
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

// untuk refresh token
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

// untuk memperbarui pengguna google
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
