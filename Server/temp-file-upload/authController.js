const deniedObj = require('./denied');

module.exports = function(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader === 'Basic secret_key') {
    next();
  } else {
    res.status(400).json(deniedObj);
  }
}
