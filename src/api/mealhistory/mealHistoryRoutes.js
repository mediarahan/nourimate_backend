const express = require('express');
const router = express.Router();
const mealHistoryController = require('./mealHistoryController');
const verifyToken = require('../../middleware/auth');

// GET /api/mealhistory
router.get('/', verifyToken, mealHistoryController.getAllMealHistories);

// GET /api/mealhistory/:mealId
router.get('/:mealHistoryId', verifyToken, mealHistoryController.getMealHistory);

// POST /api/mealhistory
router.post('/', verifyToken, mealHistoryController.createMealHistory);

// PUT /api/mealhistory/:mealId
router.put('/:mealHistoryId', verifyToken, mealHistoryController.updateMealHistory);

// DELETE /api/userprogram/:mealId
router.delete('/:mealHistoryId', verifyToken, mealHistoryController.deleteMealHistory);

module.exports = router;
