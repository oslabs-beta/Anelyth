const { query } = require('express');
const db = require('../Database.js');

const DBController = {};

DBController.addUser = async (req, res, next) => {
  try{
    const querySTR = `
    INSERT INTO users (email, username, firstName, lastName, accountType)
    VALUES ('test1@email.com', 'test_username', 'John', 'Doe', 'standard');
    `;

    const result = await db.query(querySTR)

    console.log(result);

    return next();
  } catch (err) {
    return next({
      log: `Error in DBController.addUser`,
      message: err,
    });
  }
}

DBController.initDB = async (req, res, next) => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        userID SERIAL PRIMARY KEY,
        email VARCHAR(50) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        firstName VARCHAR(30) NOT NULL,
        lastName VARCHAR(30) NOT NULL,
        accountType VARCHAR(30),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_repos (
        user_id SERIAL REFERENCES users(userID),
        repo_id SERIAL,
        repo_link VARCHAR(255),
        favorite BOOLEAN,
        PRIMARY KEY (user_id, repo_id)
      );
    `;

    // Execute the SQL query to create the tables
    await db.query(createTableQuery);

    console.log('Tables "users" and "user_repos" created successfully');

    return next();
  } catch (err) {
    return next({
      log: 'Error in DBController.initDB',
      message: err,
    });
  }
};


module.exports = DBController;