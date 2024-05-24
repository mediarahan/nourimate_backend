const UserDetail = require('../../models/UserDetail');

exports.getUserDetails = async (req, res) => {
  const userId = req.params.userId;
  try {
    const [details] = await UserDetail.getUserDetails(userId);
    if (details.length === 0) {
      return res.status(404).send('User details not found');
    }
    res.send(details[0]);
  } catch (error) {
    res
      .status(500)
      .send({message: 'Failed to retrieve user details', error: error.message});
  }
};

exports.updateUserDetails = async (req, res) => {
  const userId = req.params.userId;
  const {dob, height, waistSize, weight, gender, allergen, disease} = req.body;
  try {
    await UserDetail.updateUserDetails(
      userId,
      dob,
      height,
      waistSize,
      weight,
      gender,
      allergen,
      disease,
    );
    res.send({message: 'User details updated successfully'});
  } catch (error) {
    res
      .status(500)
      .send({message: 'Failed to update user details', error: error.message});
  }
};

exports.deleteUserDetails = async (req, res) => {
  const userId = req.params.userId;
  try {
    await UserDetail.deleteUserDetails(userId);
    res.send({message: 'User details deleted successfully'});
  } catch (error) {
    res
      .status(500)
      .send({message: 'Failed to delete user details', error: error.message});
  }
};
