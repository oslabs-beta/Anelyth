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

  //because password is not required in schema, so we can handle oAuth later and reuse createUser, need to handle cases where
  //user tries to signup without entering password
  if (!password) {
    const values = [res.locals.uid];
    const querySTR = `
      DELETE FROM users 
      WHERE user_id = $1
      ;
  `;

    try {
      await db.query(querySTR, values);
      throw new Error('Password required!');

    } catch (err) {
      return next({
        log: `Error in DBController.saveCreds: ${err}`,
        message: err,
      });
    } 
  }

  password = await db.saltAndHash(password, 10);

  const values = [password, res.locals.uid];
  const querySTR = `
    UPDATE users 
    SET password = $1
    WHERE user_id = $2
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
  console.log(req.body)
  const { userOrEmail, password } = req.body;
  
  const values = [userOrEmail];

  console.log('values:', values)

  const querySTR = `
    SELECT *
    FROM users
    WHERE username = $1 OR email = $1
    ;
  `;

  try {
    const response = await db.query(querySTR, values);
    console.log(response.rows)

    // if (response.rows.length !== 1) throw new Error('Invalid credentials.');

    if (response.rows.length === 1) {
      const { user_id, password: responsePassword } = response.rows[0];

      const match = await db.verify(password, responsePassword);
      if (match) res.locals.uid = user_id;
    } 

    return next();

  } catch (err) {
    return next({
      log: `Error in DBController.verifyCredentials: ${err}`,
      message: err,
    });
  }
};

//only used to initialize sql tables 
DBController.initDB = async (req, res, next) => {
  try {
    //leaving password as not required so we can save users later without password when using oAuth
    //we can reuse DBController.createUser this way
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(50) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255),
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