const db = require('../config/db');

// Metode getUserDetails untuk mendapatkan detail pengguna berdasarkan userId
class UserDetail {
  static getUserDetails(userId) {
    return db.execute(
      'SELECT UserDetail.*, User.* FROM UserDetail JOIN User ON UserDetail.user_id = ?',
      [userId],
    );
  }

  // Metode updateUserDetails untuk memperbarui detail pengguna berdasarkan userId
  static updateUserDetails(
    userId,
    dob,
    height,
    waistSize,
    weight,
    gender,
    allergen,
    disease,
    age,
  ) {
    const isDetailFilled = !!(
      dob &&
      height &&
      waistSize &&
      weight &&
      gender &&
      allergen &&
      disease &&
      age
    );

    // Menjalankan query untuk memperbarui detail pengguna di tabel UserDetail berdasarkan userId
    const query = `
    UPDATE UserDetail 
    SET dob = ?, height = ?, waistSize = ?, weight = ?, gender = ?, allergen = ?, disease = ?, age = ?, isDetailFilled = ?
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
      age,
      isDetailFilled,
      userId,
    ];
    return db.execute(query, params);
  }

  // Metode deleteUserDetails untuk menghapus detail pengguna berdasarkan userId
  static deleteUserDetails(userId) {
    return db
      .execute('DELETE FROM UserDetail WHERE user_id = ?', [userId])
      .then(() => db.execute('DELETE FROM User WHERE user_id = ?', [userId]));
  }
}

// Mengekspor kelas UserDetail
module.exports = UserDetail;
