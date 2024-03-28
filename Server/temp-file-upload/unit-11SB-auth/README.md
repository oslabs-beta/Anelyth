# Authentication in Express

## Summary
In this Skills Builder, you will be working with express and middleware - the building block for any express app. You will be adding a backend to our messaging application to handle sending and receiving results from the client. After we have successfully constructed the messaging portion of our server, we will then create an authorization middleware to check if the client has the proper credentials.

### Learning Goals
- [ ] Understand express as a framework around Nodejs
- [ ] Be able to create routes for an Express server
- [ ] Have a deep understanding of how middleware works
- [ ] Understand how headers play a role in authorization

## Express
Express is a framework built on top of the Nodejs platform that enables developers to easily create routes and APIs for their servers. It is one of the most popular frameworks to date (with over 20,000 stars on github), and is used in companies such as Netflix and MySpace. It is centered around middleware - small pieces of code that are built to perform a specific task on the client's request. Being a framework, express only adds structure to Nodejs applications - you can still use native Nodejs code in your express applications.

## Middleware
Middleware are functions that intercept the client's request, modifies or verifies it, then responds the client or passes it the following middleware.

![middleware](/docs/assets/images/middleware.png)

Having this modular approach makes it easy to break down the server's responsibilities to specific tasks. One middleware could be responsible for processing cookies. Another could be used to authenticate the user (or otherwise redirect them).

Many popular modules are developed as middleware. Popular ones include

- [cookie-parser](https://github.com/expressjs/cookie-parser)
- [body-parser](https://github.com/expressjs/body-parser)
- [cors](https://github.com/expressjs/cors)
- And much more...

## Headers
![header_structure](/docs/assets/images/headerstruct.png)
Headers are information sent with every request to the server that helps the server learn more about the client. Common headers include:
````
Cookie - the browser's cookie
Content-length - the size of the request body
Authorization - a users credentials
Date - the date and time that the message was sent
````

![authorization_header](/docs/assets/images/authorizationheader.jpg)
During this challenge we will be inspecting the headers of our request to ensure that the proper Authorization headers are in place before allow a user to POST a message to the server.

## Getting started

### Setup
- [ ] Run ```npm install``` to install server-side dependencies
- [ ] Run ```npm start``` to start your server. Open your browser to the following address:
````
http://localhost:3000/
````

### Testing
- [ ] Run ```npm test``` in your terminal to test your code
- [ ] Additionally, open your browser to the following address to view your application:
````
http://localhost:3000/
````

### Creating routes
- [ ] Create a route that handles ```GET``` requests to ```/messages```
- [ ] The route should connect to the ```messageController``` middleware (starter code located in `/server/messages/messageController.js`). Modify the getMessages function to respond with the provided array of messages
- [ ] Create a route that handles ```POST``` requests to ````/messages```. The message will have the format.
````
{
  message: [String]
  created_by: [String]
}
````
- [ ] Successful POST should return the following success object
````
{
  success: "Your POST request was successful"
}
````
- [ ] If the message is incorrectly formatted then the following object should be sent back to the client
````
{
  error: "Your POST request was unsuccessful"
}
````

### Authorization
- [ ] Create a middleware that checks the headers of POST requests and ensures that the following header is present:
````
Authorization: Basic secret_key
````
- [ ] If the following header is present, then the POST request passes through the middleware. If the header is not present, the following error message should be returned
````
{
  error: "Your password is incorrect"
}
````

### Resources and Links
- [http://expressjs.com/4x/api.html](http://expressjs.com/4x/api.html)
- [https://medium.com/@viral_shah/express-middlewares-demystified-f0c2c37ea6a1](https://medium.com/@viral_shah/express-middlewares-demystified-f0c2c37ea6a1)
