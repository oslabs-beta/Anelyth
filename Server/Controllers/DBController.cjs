const { query } = require('express');
const db = require('../Database.js');

const DBController = {};

DBController.addUser = async (req, res, next) => {
  const { username, email, firstName, lastName } = req.body;
  const values = [username, email, firstName, lastName];

  try {
    const querySTR = `
    INSERT INTO users (username, email, first_name, last_name, account_type)
    VALUES ($1, $2, $3, $4, 'standard');
    `;

    const result = await db.query(querySTR, values)

    return next();
  } catch (err) {
    return next({
      log: `Error in DBController.addUser: ${err}`,
      message: err,
    });
  }
}

DBController.initDB = async (req, res, next) => {
  try {
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(50) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(30) NOT NULL,
        last_name VARCHAR(30) NOT NULL,
        account_type VARCHAR(30) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createUserReposTableQuery = `
      CREATE TABLE IF NOT EXISTS user_repos (
        user_id INT NOT NULL,
        repo_id SERIAL PRIMARY KEY,
        repo_link VARCHAR(255),
        favorite BOOLEAN,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      );
    `;

    // Execute the SQL query to create the tables
    await db.query(createUsersTableQuery);
    await db.query(createUserReposTableQuery);

    console.log('Tables "users" and "user_repos" created successfully');

    return next();
  } catch (err) {
    return next({
      log: `Error in DBController.initDB: ${err}`,
      message: err,
    });
  }
};


module.exports = DBController;