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
    userId,
    dob,
    height,
    waistSize,
    weight,
    gender,
    allergen,
    disease,
  ) {
    const isDetailFilled =
      dob && height && waistSize && weight && gender && allergen && disease;

    const query = `
    UPDATE UserDetail 
    SET dob = ?, height = ?, waistSize = ?, weight = ?, gender = ?, allergen = ?, disease = ?, isDetailFilled = ?
    WHERE user_id = ?
  `;
    const params = [
      dob,
      height,
      waistSize,
      weight,
      gender,
      allergen,
      disease,
      isDetailFilled,
      userId,
    ];
    return db.execute(query, params);
  }

  // menghapus detail pengguna dan pengguna terkait berdasarkan ID pengguna
  static deleteUserDetails(userId) {
    return db
      .execute('DELETE FROM UserDetail WHERE user_id = ?', [userId])
      .then(() => db.execute('DELETE FROM User WHERE user_id = ?', [userId]));
  }
}

module.exports = UserDetail;
