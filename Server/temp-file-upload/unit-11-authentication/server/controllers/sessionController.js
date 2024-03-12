const Session = require('../models/sessionModel');

const sessionController = {};

/**
* isLoggedIn - find the appropriate session for this request in the database, then
* verify whether or not the session is still valid.
*/
sessionController.isLoggedIn = async (req, res, next) => {
  // write code here
  try {
    const sessionCookie = req.cookies.ssid;

    if (!sessionCookie) {
      return next();
    }

    const session = await Session.findById(sessionCookie);
    res.locals.session = session;
    next();

    // if (session) {
    //   return res.redirect('/secrets')
    // }

  } catch (error) {
    console.log(error)
  }
};

/**
* startSession - create and save a new Session into the database.
*/
sessionController.startSession = async (req, res, next) => {
  //write code here

  const userId = res.locals.user._id;

  const newSession = new Session ({ cookieId: userId });

  await newSession.save();

  res.cookie('ssid', newSession._id)

  next();
};

module.exports = sessionController;
