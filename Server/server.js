const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

const FileController = require('./Controllers/FileController');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // The folder where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.status(200).send('hello');
});

app.post('/api/fileupload',
  upload.any(), // Accept any files or folders
  FileController.upload,
  (req, res) => {
    res.status(200).send('upload complete');
  });

// Dependency Cruiser code
const { cruise } = require('dependency-cruiser');

const options = {
  exclude: '^node_modules',
  outputType: 'json',
  outputTo: 'dependencies.json',
};

const ARRAY_OF_FILES_AND_DIRS_TO_CRUISE = ['Client'];

cruise(ARRAY_OF_FILES_AND_DIRS_TO_CRUISE, options)
  .then((result) => {
    console.dir(result.output, { depth: 10 });
    console.log(`Dependency analysis results written to ${options.outputTo}`);
  })
  .catch((error) => {
    console.error(error);
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
