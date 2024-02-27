const messages = require('./../../data/messages');

module.exports = {

  getMessages: (req, res, next) => {
    // write code here
    res.json(messages);
    // console.log('message')
    return next();
  },

  postMessage: (req, res, next) => {
    // write code here

    const { message, created_by } = req.body;

    if (typeof message === 'string' && typeof created_by === 'string') {
      messages.push({ message, created_by });
      res.json({ success: 'Your POST request was successful'});
    } else {
      res.status(400).json({ error: 'Your POST request was unsuccessful'})
    }

    // if (typeof req.body.message === 'string' && typeof req.body.created_by === 'string') {
    //   //PUSH MESSAGES
    //   messages.push({ message: req.body.message, created_by: req.body.created_by });
    //   res.json({ success: 'Your POST request was successful'});
    // } else {
    //   res.status(400).json({ error: 'Your POST request was unsuccessful'})
    // }
  }
};
