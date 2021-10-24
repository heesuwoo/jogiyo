const mysql = require("mysql2/promise");

module.exports = mysql.createPool({
  // user: process.env.DB_UNAME,
  // host: process.env.DB_HOST,
  // password: process.env.DB_PW,
  // database: process.env.DB_DNAME,
  // port: process.env.DB_PORT,

  // mysql db
  // user: "root",
  // host: "localhost",
  // password: "1234",
  // database: "project",
  // port: "3306",

  user: "root",
  host: "34.64.161.151",
  password: "1234",
  database: "project",
  port: "3306",

  //heroku db
  //mysql -u b90ecf2d9ecce0 -h us-cdbr-east-04.cleardb.com -p heroku_d4642c56bf8158e
  //비밀번호: 42a8f899

  // user: "b90ecf2d9ecce0",
  // host: "us-cdbr-east-04.cleardb.com",
  // password: "42a8f899",
  // database: "heroku_d4642c56bf8158e",
});

// user: b90ecf2d9ecce0 - user
// host: us-cdbr-east-04.cleardb.com - ip
// passwordDB :heroku_d4642c56bf8158e
// pw :42a8f899
// db: heroku_d4642c56bf8158e
