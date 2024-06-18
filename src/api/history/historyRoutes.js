const express = require('express');
const router = express.Router();
const historyController = require('./historyController');

// GET /api/history
router.get('/', historyController.getAllHistories);

// GET /api/history/:id
router.get('/:id', historyController.getHistory);

// POST /api/history
router.post('/', historyController.createHistory);

// PUT /api/history/:id
router.put('/:id', historyController.updateHistory);

// DELETE /api/history/:id
router.delete('/:id', historyController.deleteHistory);

module.exports = router;
