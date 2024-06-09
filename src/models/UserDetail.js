const db = require('../config/db');

class UserDetail {
  static getUserDetails(userId) {
    return db.execute(
      'SELECT UserDetail.*, User.* FROM UserDetail JOIN User ON UserDetail.user_id = ?',
      [userId],
    );
  }

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

    const query = `
    UPDATE UserDetail 
    SET dob = ?, height = ?, waistSize = ?, weight = ?, gender = ?, allergen = ?, disease = ?, age = ?
    WHERE user_id = ?
  `;

    db.execute('UPDATE User SET isDetailFilled = ? WHERE user_id = ?', [
      isDetailFilled,
      userId,
    ]);

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

  static deleteUserDetails(userId) {
    return db
      .execute('DELETE FROM UserDetail WHERE user_id = ?', [userId])
      .then(() => db.execute('DELETE FROM User WHERE user_id = ?', [userId]));
  }
}

module.exports = UserDetail;
