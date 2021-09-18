const express = require("express");

const path = require("path");

const app = express();

app.use(express.json({ limit : "50mb" })); 
app.use(express.urlencoded({ limit:"50mb", extended: false }));

// // 세션
// var session = require("express-session");
// var MySQLStore = require("express-mysql-session")(session);
// var mysql = require("mysql");
// var conn = mysql.createConnection({
//   user: "root",
//   host: "localhost",
//   password: "1234",
//   database: "project",
// });
// conn.connect();

// var options = {
//   host: "localhost",
//   port: 3306,
//   user: "root",
//   password: "1234",
//   database: "project",
// };

// var sessionStore = new MySQLStore(options);

// app.use(
//   session({
//     secret: "12sdfwerwersdfserwerwef", //keboard cat (랜덤한 값)
//     resave: false,
//     saveUninitialized: true,
//     store: sessionStore,
//   })
// );

app.set("port", process.env.PORT || 8081); //process.env.PORT 없으면 8081포트로

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// post요청 받으면 req.body에 데이터 넣어주는 부분
app.use(express.json());

app.use("/css", express.static(path.join(__dirname, "../public/css/")));
app.use("/js", express.static(path.join(__dirname, "../public/js/")));

app.use("/", require("./routes/viewRouter.js"));
// app.use("/db", require("./routes/dbRouter.js"));

app.use((req, res, next) => {
  //404 처리 부분
  res.status(404).send("일치하는 주소가 없습니다. as");
});

app.use((err, req, res, next) => {
  //에러 처리 부분. 매개변수:err
  console.error(err.stack); //에러 메시지 표시
  res.status(500).send("서버에러"); //500 상태 표시 후 에러 메시지 전송
});

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "html", "main.html"));
// });

// app.get("/about", (req, res) => {
//   res.sendFile(path.join(__dirname, "html", "about.html"));
// });

app.listen(app.get("port"), () => {
  console.log("Express App on port 8081!");
});
