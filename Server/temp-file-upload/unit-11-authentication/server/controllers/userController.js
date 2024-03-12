const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const userController = {};

/**
* getAllUsers - retrieve all users from the database and stores it into res.locals
* before moving on to next middleware.
*/
userController.getAllUsers = (req, res, next) => {
  User.find({}, (err, users) => {
    // if a database error occurs, call next with the error message passed in
    // for the express global error handler to catch
    if (err) return next('Error in userController.getAllUsers: ' + JSON.stringify(err));
    
    // store retrieved users into res.locals and move on to next middleware
    res.locals.users = users;
    return next();
  });
};

/**
* createUser - create and save a new User into the database.
*/
userController.createUser = async (req, res, next) => {
  // write code here
  try {

    const {username, password} = req.body;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      const err = new Error ('Invalid username or password')
      err.status = 400;
      return next(err)
    }
    const newUser = await User.create({username, password})
    res.locals.user = newUser
    return next();

  } catch (error) {
    const err = ('Error in userController.creatreUser', error)
    return next(err)
  }
};

/*  */

/**
* verifyUser - Obtain username and password from the request body, locate
* the appropriate user in the database, and then authenticate the submitted password
* against the password stored in the database.
*/
userController.verifyUser = async (req, res, next) => {
  // write code here
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.redirect('/signup');
    }
    const passMatch = await bcrypt.compare(password, user.password);
    if (!passMatch) {
      return res.redirect('/signup')
    }
    res.locals.user = user;
    return next();
  } catch (error) {
    return next ({
      log: 'Error in userController.verifyUser',
      status: 500,
      message: {err: 'Can not verify user'}
    })
  }
};

module.exports = userController;
