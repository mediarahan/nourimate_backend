const db = require('../config/db');

class MealHistory {
  static async findAll() {
    return db.execute('SELECT * FROM consumed_recipes');
  }

  static async findById(mealHistoryId) {
    return db.execute('SELECT * FROM UserProgram WHERE meal_id = ?', [
      mealHistoryId,
    ]);
  }

  static async create(mealData) {
    const {
      recipeId,
      consumedTime,
      consumedDate,
      user_id,
    } = mealData;
    return await db.execute(
      `
            INSERT INTO consumed_recipes (recipeId, consumedDate, consumedTime, user_id) 
            VALUES (?, ?, ?, ?)`,
      [
        recipeId,
        consumedTime,
        consumedDate,
        user_id,
      ],
    );
  }

  static async update(mealHistoryId, mealData) {
    const {
      recipeId,
      consumedTime,
      consumedDate,
      user_id,
    } = mealData;
    return await db.execute(
      `
            UPDATE consumed_recipes 
            SET recipeId = ?, consumedDate = ?, consumedTime = ?, user_id = ?
            WHERE mealHistoryId = ?`,
      [
        recipeId,
        consumedTime,
        consumedDate,
        user_id,
        mealHistoryId,
      ],
    );
  }

  static async delete(mealHistoryId) {
    return db.execute('DELETE FROM consumed_recipes WHERE user_id = ?', [
      mealHistoryId,
    ]);
  }
}

module.exports = MealHistory;
