const fs = require('fs');
const path = require('path');
const multer = require('multer');

const FileController = {};

// INIT MULTER STORAGE TO DISK // 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //passing fieldname from front end as the file path
    //take the file path and remove the file name, and then use that as the directory path to save the file to in uploads folder
    const splitStr = file.fieldname.split('/');
    const dirPath = splitStr.slice(0, splitStr.length - 1).join('/');
    const filePath = path.join(__dirname, '..', 'temp-file-upload', '/', dirPath);

    //make directory before loading files into it. need recursive option, otherwise, it throws an error when the directory already exists
    fs.mkdirSync(filePath, { recursive: true });
    
    // The folder where files will be stored
    cb(null, filePath); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// SET PATH TO TEMP FILE UPLOAD DIR //
const folderPath = './Server/temp-file-upload';

// INTANCIATE MULTER UPLOAD/STORAGE //
const upload = multer({ storage: storage });

// -------------------- FUNCTIONALITY ---------------- //

// HELPER FUNC FOR RECURSIVE FILE TRAVERSAL AND DELETION OF FILES/DIRS //
const deleteFolderRecursive = (folderPath, callback) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading folder:', folderPath, err);
      callback(err);
      return;
    }

    let completed = 0;
    const total = files.length;

    if (total === 0) {
      // If the directory is empty, remove it and callback
      fs.rmdir(folderPath, (err) => {
        if (err) {
          console.error('Error deleting directory:', folderPath, err);
          callback(err);
        } else {
          callback(null);
        }
      });
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', filePath, err);
          callback(err);
          return;
        }

        if (stats.isDirectory()) {
          // Recursively delete subdirectory
          deleteFolderRecursive(filePath, (err) => {
            if (err) {
              callback(err);
            } else {
              // Check if all files and directories are deleted
              completed++;
              if (completed === total) {
                // If all files and subdirectories are deleted, remove the empty directory
                fs.rmdir(folderPath, (err) => {
                  if (err) {
                    console.error('Error deleting directory:', folderPath, err);
                    callback(err);
                  } else {
                    callback(null);
                  }
                });
              }
            }
          });
        } else {
          // Delete file
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting file:', filePath, err);
              callback(err);
            } else {
              // Check if all files and directories are deleted
              completed++;
              if (completed === total) {
                // If all files and subdirectories are deleted, remove the empty directory
                fs.rmdir(folderPath, (err) => {
                  if (err) {
                    console.error('Error deleting directory:', folderPath, err);
                    callback(err);
                  } else {
                    callback(null);
                  }
                });
              }
            }
          });
        }
      });
    });
  });
};


// UPLOAD DIR TO DISK MIDDLEWARE // 
FileController.upload = (req, res, next) => {
  try {
    console.log('step 1 hit, filecontroller.upload')
    console.log('req.body: ', req.body)
    upload.any()(req, res, (err) => {
      return next();
    });
    console.log('upload path working')
    // console.log('files outside anonymous function: ', req.files);
  } catch (err) {
    return next({
      log: 'error in FileController.upload',
      message: err
    });
  }
}


// DELETE UPLOADED DIR MIDDLEWARE //
FileController.deleteDir = (req, res, next) => {
  deleteFolderRecursive(folderPath, (err) => {
    if (err) {
      console.error('Error deleting folder:', folderPath, err);
      next({
        log: 'error in FileController.deleteDir',
        message: err
      });
    }
  });
  console.log('Directory Deleted Succsessfully')
  return next();
};




module.exports = FileController;