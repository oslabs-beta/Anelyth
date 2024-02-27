const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

const FileController = require('./Controllers/FileController');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get('/', (req, res) => {
  res.status(200).send('hello');
});

app.post('/api/fileupload',
  FileController.upload,
  (req, res) => {
    res.status(200).json(req.files);
  });

// Dependency Cruiser code
// const { cruise } = require('dependency-cruiser');

// const options = {
//   exclude: '^node_modules',
//   outputType: 'json',
//   outputTo: 'dependencies.json',
// };

// const ARRAY_OF_FILES_AND_DIRS_TO_CRUISE = ['Client'];

// cruise(ARRAY_OF_FILES_AND_DIRS_TO_CRUISE, options)
//   .then((result) => {
//     console.dir(result.output, { depth: 10 });
//     console.log(`Dependency analysis results written to ${options.outputTo}`);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
