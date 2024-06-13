// models/Auth.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');

class Auth {
  static async findUserById(userId) {
    const [users] = await db.execute('SELECT * FROM User WHERE user_id = ?', [
      userId,
    ]);

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  static async findUserByEmail(email) {
    const [users] = await db.execute('SELECT * FROM User WHERE email = ?', [
      email,
    ]);

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  static async registerUser(name, email, password, phoneNumber) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [userResult] = await connection.execute(
        'INSERT INTO User (name, email, password, phoneNumber) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, phoneNumber],
      );

      const userId = userResult.insertId;

      // Insert an empty UserDetail for this new user
      await connection.execute('INSERT INTO UserDetail (user_id) VALUES (?)', [
        userId,
      ]);

      await connection.commit();
      return {userId};
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async loginUser(email, password) {
    const [users] = await db.execute(
      'SELECT u.user_id, u.is_verified, u.isDetailFilled, u.password, u.phoneNumber FROM User u JOIN UserDetail ud ON u.user_id = ud.user_id WHERE u.email = ?',
      [email],
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];
    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      throw new Error('Invalid password');
    }

    return user;
  }

  static async findUserByEmail(email) {
    const [users] = await db.execute('SELECT * FROM User WHERE email = ?', [
      email,
    ]);

    if (users.length === 0) {
      return null;
    }

    return users[0];
  }

  static async verifyUserToken(email, token) {
    const [users] = await db.execute(
      'SELECT user_id FROM User WHERE email = ? AND (refreshToken = ? OR accessToken = ?)',
      [email, token, token],
    );
    return users.length > 0;
  }

  static async getTokenDetails(token) {
    const [users] = await db.execute(
      'SELECT user_id, accessToken, refreshToken FROM User WHERE refreshToken = ? OR accessToken = ?',
      [token, token],
    );
    return users[0];
  }

  static async updatePassword(userId, password) {
    const connection = await db.getConnection();
    try {
      await connection.execute(
        'UPDATE User SET password = ? WHERE user_id = ?',
        [password, userId],
      );
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async updatePhoneNumber(userId, phoneNumber) {
    const connection = await db.getConnection();
    try {
      await connection.execute(
        'UPDATE User SET phoneNumber = ? WHERE user_id = ?',
        [phoneNumber, userId],
      );
    } catch (error) {
      throw new Error(`Error updating phone number: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async updateTokens(userId, accessToken, refreshToken) {
    const connection = await db.getConnection();
    try {
      await connection.execute(
        'UPDATE User SET accessToken = ?, refreshToken = ? WHERE user_id = ?',
        [accessToken, refreshToken, userId],
      );
    } catch (error) {
      throw new Error(`Error updating user tokens: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  static async updateEmailToken(userId, emailToken) {
    const query = 'UPDATE User SET emailToken = ? WHERE user_id = ?';
    try {
      const [result] = await db.query(query, [emailToken, userId]);
      return result;
    } catch (err) {
      console.error('Error storing email token', err);
      throw new Error('Database operation failed');
    }
  }

  static async verifyEmailToken(userId) {
    const query = 'SELECT emailToken FROM User WHERE user_id = ?';
    try {
      const [results] = await db.query(query, [userId]);
      return results;
    } catch (err) {
      console.error('Error verifying email', err);
      throw new Error('Database operation failed');
    }
  }

  static async updateEmailVerified(userId) {
    const query = 'UPDATE User SET is_verified = TRUE WHERE user_id = ?';
    try {
      const [result] = await db.query(query, [userId]);
      return result;
    } catch (err) {
      console.error('Error updating email verification status', err);
      throw new Error('Database operation failed');
    }
  }

  static async updateSmsToken(userId, smsToken) {
    const query = 'UPDATE User SET smsToken = ? WHERE user_id = ?';
    try {
      const [result] = await db.query(query, [smsToken, userId]);
      return result;
    } catch (err) {
      console.error('Error storing SMS token', err);
      throw new Error('Database operation failed');
    }
  }

  static async verifySmsToken(userId) {
    const query = 'SELECT smsToken FROM User WHERE user_id = ?';
    try {
      const [results] = await db.query(query, [userId]);
      return results;
    } catch (err) {
      console.error('Error verifying phone number', err);
      throw new Error('Database operation failed');
    }
  }

  static async updatePhoneVerified(userId) {
    const query = 'UPDATE User SET is_verified = TRUE WHERE user_id = ?';
    try {
      const [result] = await db.query(query, [userId]);
      return result;
    } catch (err) {
      console.error('Error updating phone verification status', err);
      throw new Error('Database operation failed');
    }
  }

  static async updateGoogleUser(uid, name, phoneNumber) {
    const query = `
    INSERT INTO User (name, email, phoneNumber)
    SELECT * FROM (SELECT ? AS name, ? AS uid, ? AS phoneNumber) AS tmp
    WHERE NOT EXISTS (
      SELECT 1 FROM User WHERE email = tmp.uid
    )
  `;
    try {
      const [result] = await db.query(query, [name, uid, phoneNumber]);
      return result;
    } catch (err) {
      console.error('Error updating Google user', err);
      throw new Error('Database operation failed');
    }
  }
}

module.exports = Auth;
