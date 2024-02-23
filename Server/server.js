const fs = require('fs');
const esprima = require('esprima');
const path = require('path');
const express = require('express');

const app = express();
const port = 3000;

const filePath = path.join(__dirname, '../Client/code.js');
// const filePathTwo = './Client/moreCode.js'

console.log('filePath: ', filePath);

const codeToParse = fs.readFileSync(filePath, 'utf-8')

// console.log('logging the codeToParse' ,codeToParse);

const ast = esprima.parseScript(codeToParse);

console.log(ast);

// console.log(codeToParse)

app.get('/', (req, res) => {
    res.status(200).send(ast);
})



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });