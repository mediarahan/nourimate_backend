const MealHistory = require('../../models/mealHistory');

exports.getAllMealHistories = async (req, res) => {
  try {
    const [mealHistories] = await MealHistory.findAll();
    res.send([
      {
        message: 'Meal histories retrieved successfully',
        mealHistories,
      },
    ]);
  } catch (error) {
    res.status(500).send({
      message: 'Failed to retrieve meal histories',
      error: error.message,
    });
  }
};

exports.getMealHistory = async (req, res) => {
  try {
    const mealHistoryId = req.params.mealId;
    const [mealHistory] = await mealHistory.findById(mealHistoryId);
    if (!mealHistory) {
      return res.status(404).send('Meal Histories not found');
    }
    res.send({
      message: 'Meal Histories retrieved successfully',
      mealHistory: mealHistory[0],
    });
  } catch (error) {
    res.status(500).send({
      message: 'Failed to retrieve Meal Histories',
      error: error.message,
    });
  }
};

exports.createMealHistory = async (req, res) => {
  try {
    const mealHistoryData = req.body;
    await MealHistory.create(mealHistoryData);
    res.send({message: 'Meal Histories created successfully'});
  } catch (error) {
    res.status(500).send({
      message: 'Failed to create Meal Histories',
      error: error.message,
    });
  }
};

exports.updateMealHistory = async (req, res) => {
  try {
    const mealHistoryId = req.params.mealId;
    const mealHistoryData = req.body;
    const [updated] = await MealHistory.update(mealHistoryData, {
      where: { id: mealHistoryId }
    });
    if (updated) {
      const updatedMealHistory = await MealHistory.findByPk(mealHistoryId);
      res.send({message: 'Meal histores updated successfully', updatedMealHistory});
    } else {
      res.status(404).send('Meal histores not found');
    }
  } catch (error) {
    res.status(500).send({
      message: 'Failed to update meal histories',
      error: error.message,
    });
  }
};

exports.deleteMealHistory = async (req, res) => {
  try {
    const mealHistoryId = req.params.id;
    const deleted = await MealHistory.destroy({
      where: { id: mealHistoryId }
    });
    if (deleted) {
      res.send({message: 'Meal histories deleted successfully'});
    } else {
      res.status(404).send('Meal histories not found');
    }
  } catch (error) {
    res.status(500).send({
      message: 'Failed to delete meal histories',
      error: error.message,
    });
  }
};

