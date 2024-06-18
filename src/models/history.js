const db = require('../config/db');

class History {
  static async findAll() {
    return db.execute('SELECT * FROM history');
  }

  static async findById(historyId) {
    return db.execute('SELECT * FROM history WHERE id = ?', [historyId]);
  }

  static async create(data) {
    const { programName, startDate, endDate, calories, protein, fat, carbs, startWeight, endWeight, userId, createdAt } = data;
    return db.execute(
      `INSERT INTO history (program_name, start_date, end_date, calories, protein, fat, carbs, start_weight, end_weight, user_id, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [programName, startDate, endDate, calories, protein, fat, carbs, startWeight, endWeight, userId, createdAt]
    );
  }

  static async update(historyId, data) {
    const { programName, startDate, endDate, calories, protein, fat, carbs, startWeight, endWeight, userId, createdAt } = data;
    return db.execute(
      `UPDATE history 
       SET program_name = ?, start_date = ?, end_date = ?, calories = ?, protein = ?, fat = ?, carbs = ?, start_weight = ?, end_weight = ?, user_id = ?, created_at = ?
       WHERE id = ?`,
      [programName, startDate, endDate, calories, protein, fat, carbs, startWeight, endWeight, userId, createdAt, historyId]
    );
  }

  static async delete(historyId) {
    return db.execute('DELETE FROM history WHERE id = ?', [historyId]);
  }
}

module.exports = History;
