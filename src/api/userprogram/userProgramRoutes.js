const express = require('express');
const router = express.Router();
const userProgramController = require('./userProgramController');
const verifyToken = require('../../middleware/auth');

// GET /api/userprogram
router.get('/', verifyToken, userProgramController.getAllUserPrograms);

// GET /api/userprogram/:programId
router.get('/:programId', verifyToken, userProgramController.getUserProgram);

// POST /api/userprogram
router.post('/', verifyToken, userProgramController.createUserProgram);

// PUT /api/userprogram/:programId
router.put('/:programId', verifyToken, userProgramController.updateUserProgram);

// DELETE /api/userprogram/:programId
router.delete(
  '/:programId',
  verifyToken,
  userProgramController.deleteUserProgram,
);

module.exports = router;
