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

    // Update the isDetailFilled flag in the User table.
    db.execute('UPDATE User SET isDetailFilled = ? WHERE user_id = ?', [
      isDetailFilled,
      userId,
    ]);

    // Prepare the query to update the UserDetail table.
    const query = `UPDATE UserDetail SET dob = ?, height = ?, waistSize = ?, weight = ?, gender = ?, allergen = ?, disease = ?, age = ? WHERE user_id = ?`;
    const params = [
      dob,
      height,
      waistSize,
      weight,
      gender,
      allergen,
      disease,
      age,
      userId, // Ensure userId is last to match the placeholder in the query.
    ];

    // Execute the update query for UserDetail.
    return db.execute(query, params);
  }

  static deleteUserDetails(userId) {
    return db
      .execute('DELETE FROM UserDetail WHERE user_id = ?', [userId])
      .then(() => db.execute('DELETE FROM User WHERE user_id = ?', [userId]));
  }
}

module.exports = UserDetail;
