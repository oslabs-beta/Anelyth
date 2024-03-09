const UserController = {}

UserController.checkCredentials = (req, res, next) => {
  const { userName, password } = req.body;
  console.log('in UserController')
  next();
  //check creds
  //need to store stuff in db
  //will need to set a cookie somewhere
};

module.exports = UserController;