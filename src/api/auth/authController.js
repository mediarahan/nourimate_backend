const jwt = require('jsonwebtoken');
const Auth = require('../../models/Auth');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const admin = require('../../config/firebase');

// Load environment variables
dotenv.config();

// Replace with your JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// twilio
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

exports.signupUser = async (req, res) => {
  const {name, email, password, phoneNumber} = req.body;

  let firebaseUser;

  try {
    // Create user in Firebase
    firebaseUser = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
      disabled: false,
    });

    // store in local database
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
    // If there's an error creating the user in the local database, delete the Firebase user
    if (firebaseUser) {
      await admin.auth().deleteUser(firebaseUser.uid);
    }

    res.status(500).json({
      error: 'Error registering user',
      details: err.message + 'from' + err.stack,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const {user_id, old_password, password, confirm_password} = req.body;

    if (password !== confirm_password) {
      return res.status(400).json({message: 'Passwords do not match'});
    }

    const user = await Auth.findUserById(user_id);
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    if (!(await bcrypt.compare(old_password, user.password))) {
      return res.status(400).json({message: 'Invalid old password'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await Auth.updatePassword(user_id, hashedPassword);
    res.status(200).json({message: 'Password updated successfully'});
  } catch (error) {
    res
      .status(500)
      .json({message: 'Error updating password', error: error.message});
  }
};

exports.changePhoneNumber = async (req, res) => {
  try {
    const {user_id, phone_number, confim_phone_number} = req.body;

    if (phone_number !== confim_phone_number) {
      return res.status(400).json({message: 'Phone numbers do not match'});
    }
    await Auth.updatePhoneNumber(user_id, phone_number);
    res.status(200).json({message: 'Phone number updated successfully'});
  } catch (error) {
    res.status(500).json({message: 'Error updating phone number'});
  }
};

exports.signinUser = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await Auth.loginUser(email, password);

    // Generate JWT access token and refresh token
    const accessToken = jwt.sign({userId: user.user_id}, JWT_SECRET, {
      expiresIn: '1d',
    });
    const refreshToken = jwt.sign({userId: user.user_id}, JWT_SECRET, {
      expiresIn: '7d',
    });

    // Store the new tokens in the database
    await Auth.updateTokens(user.user_id, accessToken, refreshToken);

    // return user data without password
    delete user.password;

    // Respond with tokens
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

    // send the password reset link via email
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

exports.verifyResetPasswordToken = async (req, res) => {
  const {token} = req.params;
  const {email, password, confirm_pass} = req.body;

  if (password !== confirm_pass) {
    return res.status(400).send({message: 'Password do not match'});
  }

  try {
    // First, verify the token's validity using JWT to ensure it's correctly structured and signed
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return res.status(401).send('Invalid token format.');
    }

    // Check if the email and token match the ones in the database
    const user = await Auth.verifyUserToken(email, token);
    if (!user) {
      return res.status(401).send('Invalid or expired reset token.');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password in the database
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

exports.validateToken = async (req, res) => {
  const {token} = req.params;

  try {
    // Verify the token's validity using JWT
    jwt.verify(token, JWT_SECRET);

    // Check if the token exists in the database and matches an active session
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

exports.sendEmailVerification = async (req, res) => {
  const {userId, email} = req.body;

  try {
    // Generate a 6-digit token
    const token = Math.floor(100000 + Math.random() * 900000);

    // Store the token in the local database with a userId reference
    await Auth.updateEmailToken(userId, token);

    // Send the token via email using Firebase's SMTP configuration
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

exports.googleVerifyToken = async (req, res) => {
  try {
    const {id_token} = req.body;

    const decodedToken = await admin.auth().verifyIdToken(id_token);

    // Generate JWT access token and refresh token
    const accessToken = jwt.sign({userId: decodedToken.uid}, JWT_SECRET, {
      expiresIn: '1d',
    });
    const refreshToken = jwt.sign({userId: decodedToken.uid}, JWT_SECRET, {
      expiresIn: '7d',
    });

    // check is user exists in local database
    const user = await Auth.findUserByEmail(decodedToken.uid);

    if (!user) {
      // create user in local database
      const {userId} = await Auth.registerUser(
        decodedToken.user_id,
        decodedToken.uid,
        '22',
        '',
      );
      // Store the new tokens in the database
      await Auth.updateTokens(userId, accessToken, refreshToken);
    } else {
      // Store the new tokens in the database
      await Auth.updateTokens(user.user_id, accessToken, refreshToken);
    }

    res.send({
      accessToken,
      refreshToken,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.user_id,
      },
    });
  } catch (error) {
    res.status(401).send({status: 'error', message: error.message});
  }
};

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
