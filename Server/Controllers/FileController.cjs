const fs = require('fs');
const path = require('path');
const multer = require('multer');

const FileController = {};

// multer to disk

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'temp-file-upload')); // The folder where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const folderPath = './Server/temp-file-upload';

const upload = multer({ storage: storage });

FileController.upload = (req, res, next) => {
  try {
    console.log('step 1 hit, filecontroller.upload')
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

FileController.deleteDir = (req, res, next) => {
  try{
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error('Error reading folder:', err);
        return;
      }
      files.forEach((file) => {
        const filePath = path.join(folderPath, file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting file:', filePath, err);
          } else {
            console.log('File deleted successfully:', filePath);
          }
        });
      });
    });
    return next();
  }catch(err) {
    return next(err)
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