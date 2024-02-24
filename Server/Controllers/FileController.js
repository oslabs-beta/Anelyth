const fs = require('fs');
const path = require('path');

const FileController = {};

FileController.upload = (req, res, next) => {
  try {
    console.log('upload path working')
    console.log(req.file);
    const writeStream = fs.createWriteStream(path.join(__dirname, '../../testCode.txt'));
    writeStream.write(req.file.buffer);
    writeStream.end();
    
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = FileController;