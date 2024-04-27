const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');


dotenv.config();

const pool= new Pool({
    connectionString: process.env.DB_ENDPOINT
});

async function saltAndHash(pw, rounds) {
  return await bcrypt.hash(pw, rounds);
}

async function verify(userPw, hashPw) {
  return await bcrypt.compare(userPw, hashPw);
}

module.exports = {
  query: (text, params, callback) => {
    console.log('executed query', text);
    return pool.query(text, params, callback);
  },
  saltAndHash,
  verify
};