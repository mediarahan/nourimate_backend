const db = require('../config/db');

class MealHistory {
  static async findAll() {
    return db.execute('SELECT * FROM consumed_recipes');
  }

  static async findById(mealHistoryId) {
    return db.execute(
      'SELECT * FROM consumed_recipes WHERE mealHistoryId = ?',
      [mealHistoryId],
    );
  }

  static async create(data) {
    const {recipeId, consumedTime, consumedDate, user_id} = data;
    const sql = `
    INSERT INTO consumed_recipes 
      (recipeId, consumedTime, consumedDate, user_id) 
    VALUES 
      (?, ?, ?, ?)
  `;
    try {
      await db.execute(sql, [recipeId, consumedTime, consumedDate, user_id]);

      const [result] = await db.execute(
        'SELECT * FROM consumed_recipes WHERE mealHistoryId = LAST_INSERT_ID()',
      );
      if (result.length === 0) {
        throw new Error('Failed to fetch newly created meal history record');
      }

      return result[0];
    } catch (error) {
      throw new Error(`Error creating meal history: ${error.message}`);
    }
  }

  static async update(mealHistoryId, data) {
    const {recipeId, consumedTime, consumedDate, user_id} = data;
    return db.execute(
      `UPDATE consumed_recipes 
       SET recipeId = ?, consumedTime = ?, consumedDate = ?, user_id = ?
       WHERE mealHistoryId = ?`,
      [recipeId, consumedTime, consumedDate, user_id, mealHistoryId],
    );
  }

  static async delete(mealHistoryId) {
    return db.execute('DELETE FROM consumed_recipes WHERE mealHistoryId = ?', [
      mealHistoryId,
    ]);
  }
}

module.exports = MealHistory;
