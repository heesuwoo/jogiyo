const mysql = require("mysql2/promise");

module.exports = mysql.createPool({
  // user: process.env.DB_UNAME,
  // host: process.env.DB_HOST,
  // password: process.env.DB_PW,
  // database: process.env.DB_DNAME,
  // port: process.env.DB_PORT,
  user: "root",
  host: "localhost",
  password: "1234",
  database: "project",
  port: "3306",
});