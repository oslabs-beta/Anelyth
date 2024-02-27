const fs = require('fs');
const path = require('path');
const multer = require('multer');

const FileController = {};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //passing fieldname from front end as the file path
    //take the file path and remove the file name, and then use that as the directory path to save the file to in uploads folder
    const splitStr = file.fieldname.split('/');
    const dirPath = splitStr.slice(0, splitStr.length - 1).join('/');
    const filePath = path.join(__dirname, '..', 'uploads', '/', dirPath);

    //make directory before loading files into it. need recursive option, otherwise, it throws an error when the directory already exists
    fs.mkdirSync(filePath, { recursive: true });
    
    // The folder where files will be stored
    cb(null, filePath); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

FileController.upload = (req, res, next) => {
  try {
    upload.any()(req, res, (err) => {
      console.log('file objects inside FileController.upload: ', req.files)
      return next();
    });

  } catch (err) {
    return next(err);
  }
}


module.exports = FileController;