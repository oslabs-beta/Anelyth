const SessionController = {};

SessionController.createCookie = (req, res, next) => {
  if (res.locals.uid) {
    res.cookie('temp-id', res.locals.uid, { httpOnly: true });
  }
  return next();
};

module.exports = SessionController;