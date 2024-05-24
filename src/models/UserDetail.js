const db = require('../config/db');

class UserDetail {
  // mendapatkan detail pengguna berdasarkan ID pengguna
  static getUserDetails(userId) {
    return db.execute(
      'SELECT UserDetail.*, User.emailVerified, User.phoneVerified FROM UserDetail JOIN User ON UserDetail.user_id = ?',
      [userId],
    );
  }

  // memperbarui detail pengguna dengan nilai-nilai baru
  static updateUserDetails(
    detailId,
    dob,
    height,
    waistSize,
    weight,
    gender,
    allergen,
    disease,
  ) {
    return db.execute(
      'UPDATE UserDetail SET dob = ?, height = ?, waistSize = ?, weight = ?, gender = ?, allergen = ?, disease = ? WHERE detail_id = ?',
      [dob, height, waistSize, weight, gender, allergen, disease, detailId],
    );
  }

  // menghapus detail pengguna dan pengguna terkait berdasarkan ID pengguna
  static deleteUserDetails(userId) {
    return db
      .execute('DELETE FROM UserDetail WHERE user_id = ?', [userId])
      .then(() => db.execute('DELETE FROM User WHERE user_id = ?', [userId]));
  }
}

module.exports = UserDetail;
