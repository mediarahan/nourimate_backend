const History = require('../../models/history');

exports.getAllHistories = async (req, res) => {
  try {
    const [histories] = await History.findAll();
    res.status(200).json({
      message: 'Histories retrieved successfully',
      histories,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve histories',
      error: error.message,
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const {id} = req.params;
    const [history] = await History.findById(id);
    if (!history) {
      return res.status(404).json({message: 'History not found'});
    }
    res.status(200).json({
      message: 'History retrieved successfully',
      history,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve history',
      error: error.message,
    });
  }
};

exports.createHistory = async (req, res) => {
  try {
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
    } = req.body;

    const historyData = {
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
    };

    const createdHistory = await History.create(historyData);

    res.status(201).json({
      message: 'History created successfully',
      history: createdHistory, // Return the newly created history object
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to create history',
      error: error.message,
    });
  }
};

exports.updateHistory = async (req, res) => {
  try {
    const {id} = req.params;
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
    } = req.body;
    const [updated] = await History.update(id, {
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
    });
    if (updated) {
      const [updatedHistory] = await History.findById(id);
      res.status(200).json({
        message: 'History updated successfully',
        history: updatedHistory,
      });
    } else {
      res.status(404).json({message: 'History not found'});
    }
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update history',
      error: error.message,
    });
  }
};

exports.deleteHistory = async (req, res) => {
  try {
    const {id} = req.params;
    const deleted = await History.delete(id);
    if (deleted) {
      res.status(200).json({message: 'History deleted successfully'});
    } else {
      res.status(404).json({message: 'History not found'});
    }
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete history',
      error: error.message,
    });
  }
};
