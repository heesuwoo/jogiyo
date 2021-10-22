/*firebase */
const admin = require('firebase-admin')

let serAccount = require('../firebase_serverkey.json')

admin.initializeApp({
  credential: admin.credential.cert(serAccount),
})

/*mysql, express*/ 
const express = require("express");

const path = require("path");

const app = express();

app.use(express.json({ limit : "50mb" })); 
app.use(express.urlencoded({ limit:"50mb", extended: false }));

app.set("port", process.env.PORT || 8081); //process.env.PORT 없으면 8081포트로

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// post요청 받으면 req.body에 데이터 넣어주는 부분
app.use(express.json());

app.use("/css", express.static(path.join(__dirname, "../public/css/")));
app.use("/js", express.static(path.join(__dirname, "../public/js/")));

app.use("/", require("./routes/viewRouter.js"));

app.use((req, res, next) => {
  //404 처리 부분
  res.status(404).send("일치하는 주소가 없습니다.");
  app.use("/", require("./routes/viewRouter.js"));
});

app.use((err, req, res, next) => {
  //에러 처리 부분. 매개변수:err
  console.error(err.stack); //에러 메시지 표시
  res.status(500).send("서버에러"); //500 상태 표시 후 에러 메시지 전송
});


app.listen(app.get("port"), () => {
  console.log("Express App on port 8081!");
});
