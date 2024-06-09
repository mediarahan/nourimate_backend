const UserProgram = require('../../models/userProgram');

exports.getAllUserPrograms = async (req, res) => {
  try {
    const [programs] = await UserProgram.findAll();
    res.send([
      {
        message: 'User programs retrieved successfully',
        programs,
      },
    ]);
  } catch (error) {
    res.status(500).send({
      message: 'Failed to retrieve user programs',
      error: error.message,
    });
  }
};

exports.getUserProgram = async (req, res) => {
  try {
    const userProgramId = req.params.programId;
    const [program] = await UserProgram.findById(userProgramId);
    if (!program) {
      return res.status(404).send('User program not found');
    }
    res.send({
      message: 'User program retrieved successfully',
      program: program[0],
    });
  } catch (error) {
    res.status(500).send({
      message: 'Failed to retrieve user program',
      error: error.message,
    });
  }
};

exports.createUserProgram = async (req, res) => {
  try {
    const programData = req.body;
    await UserProgram.create(programData);
    res.send({message: 'User program created successfully'});
  } catch (error) {
    res.status(500).send({
      message: 'Failed to create user program',
      error: error.message,
    });
  }
};

exports.updateUserProgram = async (req, res) => {
  try {
    const userProgramId = req.params.programId;
    const programData = req.body;
    await UserProgram.update(userProgramId, programData);
    res.send({message: 'User program updated successfully'});
  } catch (error) {
    res.status(500).send({
      message: 'Failed to update user program',
      error: error.message,
    });
  }
};

exports.deleteUserProgram = async (req, res) => {
  try {
    const userProgramId = req.params.programId;
    await UserProgram.delete(userProgramId);
    res.send({message: 'User program deleted successfully'});
  } catch (error) {
    res.status(500).send({
      message: 'Failed to delete user program',
      error: error.message,
    });
  }
};
