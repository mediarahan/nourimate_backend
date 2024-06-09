const db = require('../config/db');

class UserProgram {
  static async findAll() {
    return db.execute('SELECT * FROM UserProgram');
  }

  static async findById(userProgramId) {
    return db.execute('SELECT * FROM UserProgram WHERE program_id = ?', [
      userProgramId,
    ]);
  }

  static async create(programData) {
    const {
      ongoingProgram,
      startDate,
      endDate,
      startWeight,
      endWeight,
      editCurrentWeightDate,
      user_id,
    } = programData;
    return await db.execute(
      `
            INSERT INTO UserProgram (ongoingProgram, startDate, endDate, startWeight, endWeight, editCurrentWeightDate, user_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ongoingProgram,
        startDate,
        endDate,
        startWeight,
        endWeight,
        editCurrentWeightDate,
        user_id,
      ],
    );
  }

  static async update(userProgramId, programData) {
    const {
      ongoingProgram,
      startDate,
      endDate,
      startWeight,
      endWeight,
      editCurrentWeightDate,
    } = programData;
    return await db.execute(
      `
            UPDATE UserProgram 
            SET ongoingProgram = ?, startDate = ?, endDate = ?, startWeight = ?, endWeight = ?, editCurrentWeightDate = ?
            WHERE program_id = ?`,
      [
        ongoingProgram,
        startDate,
        endDate,
        startWeight,
        endWeight,
        editCurrentWeightDate,
        userProgramId,
      ],
    );
  }

  static async delete(userProgramId) {
    return db.execute('DELETE FROM UserProgram WHERE program_id = ?', [
      userProgramId,
    ]);
  }
}

module.exports = UserProgram;
