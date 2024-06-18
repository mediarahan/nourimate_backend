const MealHistory = require('../../models/mealHistory');

exports.getAllMealHistories = async (req, res) => {
  try {
    const [mealHistories] = await MealHistory.findAll();
    res.status(200).json({
      message: 'Meal histories retrieved successfully',
      mealHistories: mealHistories,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve meal histories',
      error: error.message,
    });
  }
};

exports.getMealHistory = async (req, res) => {
  const mealHistoryId = req.params.mealHistoryId;
  try {
    const [mealHistory] = await MealHistory.findById(mealHistoryId);
    if (!mealHistory) {
      return res.status(404).json({ message: 'Meal history not found' });
    }
    res.status(200).json({
      message: 'Meal history retrieved successfully',
      mealHistory: mealHistory,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve meal history',
      error: error.message,
    });
  }
};

exports.createMealHistory = async (req, res) => {
  const { recipeId, consumedTime, consumedDate, user_id } = req.body;
  try {
    await MealHistory.create({
      recipeId,
      consumedTime,
      consumedDate,
      user_id,
    });
    res.status(201).json({ message: 'Meal history created successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create meal history',
      error: error.message,
    });
  }
};

exports.updateMealHistory = async (req, res) => {
  const mealHistoryId = req.params.mealHistoryId;
  const { recipeId, consumedTime, consumedDate, user_id } = req.body;
  try {
    const updated = await MealHistory.update(mealHistoryId, {
      recipeId,
      consumedTime,
      consumedDate,
      user_id,
    });
    if (updated) {
      const updatedMealHistory = await MealHistory.findById(mealHistoryId);
      res.status(200).json({
        message: 'Meal history updated successfully',
        updatedMealHistory: updatedMealHistory[0],
      });
    } else {
      res.status(404).json({ message: 'Meal history not found' });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update meal history',
      error: error.message,
    });
  }
};

exports.deleteMealHistory = async (req, res) => {
  const mealHistoryId = req.params.mealHistoryId;
  try {
    const deleted = await MealHistory.delete(mealHistoryId);
    if (deleted) {
      res.status(200).json({ message: 'Meal history deleted successfully' });
    } else {
      res.status(404).json({ message: 'Meal history not found' });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete meal history',
      error: error.message,
    });
  }
};