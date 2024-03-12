const cookieController = {};

/**
* setCookie - set a cookie with a random number
*/
cookieController.setCookie = (req, res, next) => {
  // write code here 
  const randomNumber = Math.floor(Math.random() * 100);
  res.cookie('codesmith', 'hi')
  res.cookie('secret', randomNumber, {httpOnly: true})
  next();
}

/**
* setSSIDCookie - store the user id in a cookie
*/
cookieController.setSSIDCookie = (req, res, next) => {
  // write code here
  
  res.cookie('ssid', res.locals.user._id, {httpOnly: true})
  next();
}

module.exports = cookieController;
