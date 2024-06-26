exports.validatePassword = (req, res, next) => {
  const password = req.body.password;
  const hasNumber = /\d/;
  if (password.length >= 8 && hasNumber.test(password)) {
    next();
  } else {
    res
      .status(400)
      .json({
        message:
          'Password must be at least 8 characters long and include a number',
      });
  }
};
