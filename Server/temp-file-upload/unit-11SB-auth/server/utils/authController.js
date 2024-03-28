const deniedObj = require('./denied');

module.exports = function(req, res, next) {
  const header = req.headers.authorization;
  if (header === 'Basic secret_key'){
    res.locals.newMessage = req.body;
    next();
  } else {
    return res.status(400).json(deniedObj);
  }

}
