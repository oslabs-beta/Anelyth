const { query } = require('express');
const db = require('../Database.js');

const DBController = {};

DBController.createUser = async (req, res, next) => {
  const { username, email, firstName, lastName } = req.body;
  const values = [username, email, firstName, lastName];

  try {
    const querySTR = `
    INSERT INTO users (username, email, first_name, last_name, account_type)
    VALUES ($1, $2, $3, $4, 'standard')
    RETURNING user_id
    ;
    `;

    const response = await db.query(querySTR, values);
    if (response.rows.length < 1) {
      throw new Error('User not created');
    }
    const { user_id } = response.rows[0];
    res.locals.uid = user_id;

    return next();

  } catch (err) {
    return next({
      log: `Error in DBController.createUser: ${err}`,
      message: err,
    });
  }
}

DBController.saveCreds = async (req, res, next) => {
  let { password } = req.body;
  password = await db.saltAndHash(password, 10);

  const values = [res.locals.uid, password];
  const querySTR = `
    INSERT INTO creds (user_id, cred)
    VALUES ($1, $2)
    ;
  `;

  try {
    await db.query(querySTR, values);
    return next();

  } catch (err) {
    return next({
      log: `Error in DBController.saveCreds: ${err}`,
      message: err,
    });
  }

};

DBController.verifyCredentials = async (req, res, next) => {
  const { username, password } = req.body;
  
  const values = [username];
  const querySTR = `
  SELECT * 
  FROM creds 
  WHERE creds.user_id = (
    SELECT users.user_id 
    FROM users
    WHERE users.username = $1 
  )
  ;
`;

  try {
    const response = await db.query(querySTR, values);

    if (response.rows.length > 1) throw new Error('More than 1 result returned.')

    if (response.rows.length === 1) {
      const { cred, user_id } = response.rows[0];

      const match = await db.verify(password, cred);
      if (match) res.locals.uid = user_id;
    } 

    return next();

  } catch (err) {
    return next({
      log: `Error in DBController.verifyCredentials: ${err}`,
      message: err,
    });
  }

  //will need to set a cookie somewhere
};

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

    const createCredsTableQuery = `
    CREATE TABLE IF NOT EXISTS creds (
      cred_id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      cred VARCHAR(255) NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
  `;

    // Execute the SQL query to create the tables
    await db.query(createUsersTableQuery);
    await db.query(createUserReposTableQuery);
    await db.query(createCredsTableQuery);

    console.log('Tables "users" and "user_repos" and "creds" created successfully');

    return next();
  } catch (err) {
    return next({
      log: `Error in DBController.initDB: ${err}`,
      message: err,
    });
  }
};


module.exports = DBController;