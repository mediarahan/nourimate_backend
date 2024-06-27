const MealHistory = require('../../models/mealHistory');

exports.getAllMealHistories = async (req, res) => {
  try {
    const mealHistories = await MealHistory.findAll();
    res.status(200).json({
      message: 'Meal histories retrieved successfully',
      mealHistories,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve meal histories',
      error: error.message,
    });
  }
};

exports.getMealHistory = async (req, res) => {
  try {
    const {id} = req.params;
    const [mealHistory] = await MealHistory.findById(id);
    if (!mealHistory) {
      return res.status(404).json({message: 'Meal history not found'});
    }
    res.status(200).json({
      message: 'Meal history retrieved successfully',
      mealHistory,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve meal history',
      error: error.message,
    });
  }
};

exports.createMealHistory = async (req, res) => {
  try {
    const {recipeId, consumedTime, consumedDate, user_id} = req.body;
    const [result] = await MealHistory.create({
      recipeId,
      consumedTime,
      consumedDate,
      user_id,
    });
    res
      .status(201)
      .json({message: 'Meal history created successfully', history: result});
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create meal history',
      error: error.message,
    });
  }
};

exports.updateMealHistory = async (req, res) => {
  try {
    const {id} = req.params;
    const {recipeId, consumedTime, consumedDate, user_id} = req.body;
    const [updated] = await MealHistory.update(id, {
      recipeId,
      consumedTime,
      consumedDate,
      user_id,
    });
    if (updated) {
      const updatedMealHistory = await MealHistory.findById(id);
      res.status(200).json({
        message: 'Meal history updated successfully',
        updatedMealHistory: updatedMealHistory[0],
      });
    } else {
      res.status(404).json({message: 'Meal history not found'});
    }
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update meal history',
      error: error.message,
    });
  }
};

exports.deleteMealHistory = async (req, res) => {
  try {
    const {id} = req.params;
    const deleted = await MealHistory.delete(id);
    if (deleted) {
      res.status(200).json({message: 'Meal history deleted successfully'});
    } else {
      res.status(404).json({message: 'Meal history not found'});
    }
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete meal history',
      error: error.message,
    });
  }
};
