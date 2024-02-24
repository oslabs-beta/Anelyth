const fs = require('fs');
const esprima = require('esprima');
const path = require('path');
const express = require('express');
const multer = require('multer');

const app = express();
const port = 3000;

const FileController = require('./Controllers/FileController');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).send('hello');
})

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/fileupload', 
    upload.single('file'),
    FileController.upload,
    (req, res) => {
        return res.status(200).json({ message: 'upload complete' })
    }
)



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });