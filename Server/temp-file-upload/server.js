const express = require('express');
const app = express();
const path = require('path');
const messageController = require('./messages/messageController');
const authController = require('./utils/authController');

app.use(express.json());
app.use(express.static(path.join(__dirname, './../client')));

// place routes here

app.get('/messages', messageController.getMessages);
app.post('/messages', authController, messageController.postMessage);


app.listen(3000);

module.exports = app;
