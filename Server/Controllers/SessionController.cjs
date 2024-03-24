const SessionController = {};

SessionController.createCookie = (req, res, next) => {
  if (res.locals.uid) {
    res.cookie('temp-id', res.locals.uid, { httpOnly: true, maxAge: (1000*60*60*24) });
  }
  return next();
};

module.exports = SessionController;