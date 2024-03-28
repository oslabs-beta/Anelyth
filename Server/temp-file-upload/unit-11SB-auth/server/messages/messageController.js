const messages = require('./../../data/messages');
const success = require('./../utils/success.js');
const error = require('./../utils/error.js');

module.exports = {
  getMessages: (req, res, next) => {
    res.locals.messages = messages;
    return next();
  },
  postMessage: (req, res, next) => {
    const inputMessage = res.locals.newMessage;

    if (typeof inputMessage.message === 'string' && typeof inputMessage.created_by === 'string'){
      messages.push(res.locals.newMessage)

      res.status(200).json(success)
    } else {
      res.status(400).json({error: 'Your POST request was unsuccessful'})
    }
    
  }
};
