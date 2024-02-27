const fs = require('fs');
const path = require('path');
const multer = require('multer');

const FileController = {};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads')); // The folder where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

FileController.upload = (req, res, next) => {
  try {
    upload.any()(req, res, (err) => {
      // console.log('inside anonymous function req.files: ', req.files)
      return next();
    });
    console.log('upload path working')
    // console.log('files outside anonymous function: ', req.files);
  } catch (err) {
    console.log('err:', err)
    return next(err);
  }
}



// FileController.upload = async (req, res, next) => {
//   try {
//     await upload.any()(req, res, (err) => {
//       const data = req.files;
//       // console.log('am i here?', data);
//       res.locals.data = data;
//       return next();
//     });
//   } catch (err) {
//     console.log('err:', err)
//     return next(err);
//   }
// }




module.exports = FileController;