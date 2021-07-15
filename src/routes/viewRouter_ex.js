const express = require("express");
const path = require("path");

const router = express.Router(); // 라우터 분리

const db = require("../database/db");

// 주문접수
router.get("/orders", (req, res) => {
  //   res.sendFile(path.join(__dirname, "html", "about.html"));
  //res.send("ㅇ없는ㄴ");

  var userID = req.session.userID;
  if (userID != undefined) {
    res.render("orders", { list: [] });
  } else {
    res.send(
      '<script type="text/javascript">alert("로그인을 먼저 해주세요."); location.href="/login"</script>'
    );
  }

  // res.render("orders", { list: [] });
});

// router.get("/login", (req, res, next) => {
//   res.render("login");
// });

// 로그인
router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  const { uid, pw } = req.body;
  req.session.userID = uid;
  // console.log(req.session.userID);
  // db에서 확인
  db.login(uid, pw).then(function (login_check) {
    //async인 프로미스 값을 받아오기 위해 .then()을 사용함.
    if (login_check === -1) {
      res.json({ code: -1, msg: "insert X" }); //입력X
    } else if (login_check == true) {
      res.json({ code: 0, msg: "success" }); //로그인 성공
    } else {
      res.json({ code: 1, msg: "discord password" }); //패스워드 틀림
    }
  });
});

// 회원가입
router.get("/join", (req, res, next) => {
  res.render("join");
});

router.post("/join", (req, res, next) => {
  const { id, pw, name, email, r_name } = req.body;
  // db에서 확인
  db.join_check(id, email, r_name).then(function (dbresult) {
    if (dbresult == true) {
      db.join(id, pw, name, email, r_name).then(function (insert_db) {
        if (insert_db == true) {
          res.json({ code: 0, msg: "success" }); //code: 0; 회원가입 성공
        } else {
          res.json({ code: -2, msg: "join_fail" }); //code: -2; db.join 에러
        }
      });
    } else if (dbresult == -1) {
      res.json({ code: -1, msg: "duplicate" }); //code: -1; 중복
    } else {
      res.json({ code: 1, msg: "join_check error" }); //code: 1; db.joincheck 에러
    }
  });
});

// 매장관리
router.get("/management", (req, res, next) => {
  // 시간
  // const now = new Date();
  // const finish = new Date();
  // const finishMilli = finish.getTime();
  // const nowMili = now.getTime();
  // const gapMilli = finishMilli - nowMili;

  // const gapMinutes = gapMilli / (60 * 1000);

  // var hours = now.getHours(); //현재 시 (자동으로 흐름)
  // var minutes = now.getMinutes(); //현재 분 (자동으로 흐름)

  // console.log("현재시각:", hours, minutes);

  // //현재시각에 70분 더한 시간
  // //after_hours: 일정 시간 뒤의 시
  // //after_minutes: 일정 시간 뒤의 분
  // af_minutes = now.getMinutes() + 70;
  // if (af_minutes >= 60) {
  //   var after_minutes_div = af_minutes / 60;
  //   after_minutes_div = parseInt(after_minutes_div);
  //   var after_minutes = af_minutes % 60;
  //   var after_hours = hours + after_minutes_div;
  //   if (after_hours >= 24) {
  //     after_hours -= 24;
  //   }
  // }
  // console.log("70분 후 : " + after_hours, "시", after_minutes + "분");

  // //자정 넘어가서 음수 되는것 방지
  // if (12 <= hours && hours <= 23 && 0 <= after_hours < 12) {
  //   after_hours += 24;
  // }
  // //일정 시간 뒤 - 현재 시각
  // var gap_h = after_hours - hours; //'시'의 차이 구하기
  // var gap_h_to_m = gap_h * 60; //'시'의 차이를 '분'으로 바꾸기
  // var gap_m = after_minutes + gap_h_to_m;
  // var gap = gap_m - minutes; //'분'의 차이 구하기

  // console.log("차이: ", gap); //최종 차이(분 단위)

  const { id } = req.query;
  // res.render("management");
  db.cookieToID(id).then(function (result) {
    var userID = result; //coookie에서 userID가져옴

    db.business_select(userID).then(function (re_time) {
      console.log("re_time: ", re_time);
      if (re_time == undefined || re_time == false) {
        res.render("management", { remain: 0 });
      } else {
        res.render("management", { remain: re_time });
      }
    });
  });
  res.render("management", { remain: 15 });
});

router.post("/management", (req, res, next) => {
  const { tem_stop_time } = req.body;
  //console.log(req.session.userID);
  var userID = req.session.userID;
  // db에서 확인
  db.business_stop(userID, tem_stop_time).then(function (db_result) {
    if (db_result) {
      res.json({ code: 0, session: "sampleSession1" });
    } else {
      res.json({ code: 1, message: "" });
    }
  });
});

// 좌석배치도
router.get("/seating", (req, res, next) => {
  res.render("seating");
});

router.post("/seating", (req, res, next) => {
  //const { id, pw, name, email, r_name } = req.body;
  // db에서 확인
  //db.seating(id, pw, name, email, r_name);
  // #회원가입 성공 시
  //res.json({ code: 0, session: "sampleSession1" });
  // # 실패하면
  // res.json({code: 1, message: ''})
  //res.send("success");
});

// 메인
router.get("/main", (req, res, next) => {
  res.render("main");
});

router.post("/main", (req, res, next) => {
  //const { id, pw, name, email, r_name } = req.body;
  // db에서 확인
  //db.seating(id, pw, name, email, r_name);
  // #회원가입 성공 시
  //res.json({ code: 0, session: "sampleSession1" });
  // # 실패하면
  // res.json({code: 1, message: ''})
  //res.send("success");
});

// 로그아웃
router.post("/logout", (req, res, next) => {
  delete req.session.userID;

  req.session.save(function () {
    res.redirect("/main");
    //console.log("로그아웃후 세션: ", req.session.userID);
  });
});

module.exports = router; // 모듈로 만드는 부분
