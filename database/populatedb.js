const { Client } = require("pg");
require("dotenv").config();

const SQL = 
`CREATE TABLE IF NOT EXISTS users(
  id PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  password TEXT,
  isMember BOOLEAN,
  isAdmin BOOLEAN
);

CREATE TABLE IF NOT EXISTS posts(
  id PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT,
  content TEXT,
  user_id INTEGER,
  time DATETIME
)`

module.exports = async function main(){
    const client = new Client({
        connectionString : process.env.DATABASE_URL,
        ssl : {rejectUnauthorized : false}
    })
    await client.connect();
    await client.query(SQL);
    await client.end();
}