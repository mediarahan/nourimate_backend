const admin = require('firebase-admin');
const serviceAccount = require('./service-account-file.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('Firebase admin initialized successfully.');
} catch (error) {
  console.error('Failed to initialize Firebase admin:', error);
}

module.exports = admin;
