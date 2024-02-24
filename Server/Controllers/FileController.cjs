const FileController = {};

FileController.upload = (req, res, next) => {
  try {
    console.log('upload path working')
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = FileController;