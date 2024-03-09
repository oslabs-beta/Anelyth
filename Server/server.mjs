// const fs = require('fs');
// const esprima = require('esprima');


import path from "path";
import express from "express";


const app = express();
const port = 3000;

// --- Importing Controllers --- //
import FileController from "./Controllers/FileController.cjs";
import DCController from "./Controllers/DCController.mjs";
import S3Controller from "./Controllers/S3Controller.mjs";
import DBController from "./Controllers/DBController.cjs";


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).send('hello');
})

app.post('/api/fileupload',
    FileController.upload,
    DCController.analyze,
    DCController.getTreeWithDependencies,
    FileController.deleteDir,
    // S3Controller.upload,
    (req, res) => {
        res.status(200).send(res.locals.hierarchyWithDependencies);
    }
)

app.post('/api/signup',
    DBController.addUser,
    (req, res) => {
        res.status(200).send('User added');
    }
)

app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  return res.status(errorObj.status).json(errorObj.message);
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });