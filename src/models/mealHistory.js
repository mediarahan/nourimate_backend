const db = require('../config/db');;

class MealHistory {
  static async findAll() {
    return db.execute('SELECT * FROM consumed_recipes');
  }

  static async findById(mealHistoryId) {
    return db.execute('SELECT * FROM consumed_recipes WHERE id = ?', [mealHistoryId]);
  }

  static async create(data) {
    const { recipeId, consumedTime, consumedDate, user_id } = data;
    return db.execute(
      `INSERT INTO consumed_recipes (recipe_id, consumedTime, consumedDate, user_id) 
       VALUES (?, ?, ?, ?)`,
      [recipeId, consumedTime, consumedDate, user_id]
    );
  }

  static async update(mealHistoryId, data) {
    const { recipeId, consumedTime, consumedDate, user_id } = data;
    return db.execute(
      `UPDATE consumed_recipes 
       SET recipe_id = ?, consumedTime = ?, consumedDate = ?, user_id = ?
       WHERE id = ?`,
      [recipeId, consumedTime, consumedDate, user_id, mealHistoryId]
    );
  }

  static async delete(mealHistoryId) {
    return db.execute('DELETE FROM consumed_recipes WHERE id = ?', [mealHistoryId]);
  }
}

module.exports = MealHistory;