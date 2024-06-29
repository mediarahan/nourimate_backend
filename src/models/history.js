const db = require('../config/db');

class History {
  static async findAll() {
    return db.execute('SELECT * FROM history');
  }

  static async findById(historyId) {
    return db.execute('SELECT * FROM history WHERE id = ?', [historyId]);
  }

  static async create(data) {
    const {
      programName,
      startDate,
      endDate,
      calories,
      protein,
      fat,
      carbs,
      startWeight,
      endWeight,
      userId,
      createdAt,
    } = data;
    const sql = `
    INSERT INTO history 
      (program_name, start_date, end_date, calories, protein, fat, carbs, start_weight, end_weight, user_id, created_at) 
    VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    try {
      await db.execute(sql, [
        programName,
        startDate,
        endDate,
        calories,
        protein,
        fat,
        carbs,
        startWeight,
        endWeight,
        userId,
        createdAt,
      ]);

      // Fetch the newly inserted record
      const [result] = await db.execute(
        'SELECT * FROM history WHERE id = LAST_INSERT_ID()',
      );
      if (result.length === 0) {
        throw new Error('Failed to fetch newly created history record');
      }

      return result[0]; // Return the newly created record object
    } catch (error) {
      throw new Error(`Error creating history: ${error.message}`);
    }
  }

  static async update(historyId, data) {
    const {
      programName,
      startDate,
      endDate,
      calories,
      protein,
      fat,
      carbs,
      startWeight,
      endWeight,
      userId,
      createdAt,
    } = data;
    return db.execute(
      `UPDATE history 
       SET program_name = ?, start_date = ?, end_date = ?, calories = ?, protein = ?, fat = ?, carbs = ?, start_weight = ?, end_weight = ?, user_id = ?, created_at = ?
       WHERE id = ?`,
      [
        programName,
        startDate,
        endDate,
        calories,
        protein,
        fat,
        carbs,
        startWeight,
        endWeight,
        userId,
        createdAt,
        historyId,
      ],
    );
  }

  static async delete(historyId) {
    return db.execute('DELETE FROM history WHERE id = ?', [historyId]);
  }
}

module.exports = History;
