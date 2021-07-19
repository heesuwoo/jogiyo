const { json } = require("express");
const express = require("express");
const path = require("path");
const { features } = require("process");

const router = express.Router(); // 라우터 분리

const db = require("../database/db");

// 로그인
router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  const { uid, pw } = req.body;
  // req.session.userID = uid;
  // console.log(req.session.userID);

  // db에서 확인
  db.login(uid, pw).then(function (login_check) {
    //async인 프로미스 값을 받아오기 위해 .then()을 사용함.
    if (login_check === -1) {
      res.json({ code: -1, msg: "insert X" }); //입력X
    } else if (login_check == false) {
      res.json({ code: 1, msg: "discord password" }); //패스워드 틀림
    } else {
      const session = login_check; //로그인한 사용자의 세션 값
      // console.log("로그인 세션: ", session);
      res.json({ code: 0, msg: "success", session }); //세션값
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
      res.json({ code: -1, msg: "duplicate" }); //code: -1; 중복되는 사항이 있음
    } else {
      res.json({ code: 1, msg: "join_check error" }); //code: 1; db.joincheck 에러
    }
  });
});

// 주문접수
router.get("/orders", (req, res) => {
  const { id } = req.query;
  console.log("order 쿠키: ", id);
  res.render("orders", { list: [] });
});

// 매장관리
router.get("/management", (req, res, next) => {
  // console.log("차이: ", gap); //최종 차이(분 단위)

  const { id } = req.query;
  // res.render("management");
  db.cookieToID(id).then(function (result) {
    var userID = result; //coookie에서 userID가져옴

    db.business_select(userID).then(function (re_time) {
      if (re_time == undefined || re_time == false) {
        res.render("management", { remain: 0 });
      } else {
        const now = new Date();
        const date = re_time.finishDate; //db에서 finishDate에 접근해서 날짜,시간 받아오기
        const finish = new Date(date); //db시간을 읽어오기위해 객체에 저장하기
        const finishMilli = finish.getTime(); //db저장값 밀리초로 받아오기
        const nowMili = now.getTime(); //현재 시간 밀리초로 받아오기
        const gapMilli = finishMilli - nowMili; //차이 계산
        const gapMinutes = gapMilli / (60 * 1000); //분으로 바꾸기
        const gap = Math.round(gapMinutes);

        // console.log("분으로 바꾼 결과값", gap);
        res.render("management", { remain: gap });
      }
    });
  });
  // res.render("management", { remain: re_time });
});

router.post("/management", (req, res, next) => {
  const {
    cookie,
    tem_stop_time,
    m_s_h,
    m_s_m,
    m_f_h,
    m_f_m,
    sa_s_h,
    sa_s_m,
    sa_f_h,
    sa_f_m,
    su_s_h,
    su_s_m,
    su_f_h,
    su_f_m,
  } = req.body;

  // db에서 확인
  db.cookieToID(cookie).then(function (result) {
    var userID = result; //coookie에서 userID가져옴

    //일시 정지
    db.business_stop_select(userID, tem_stop_time).then(function (db_result) {
      console.log(db_result);
      if (db_result == -1) {
        //영업 중지가 이미 실행중
        res.json({ code: -1, message: "already start" });
      } else if (db_result == 0) {
        //데이터 삽입 실패
        res.json({ code: 0, message: "insert fail" });
      } else if (db_result == false) {
        //에러
        res.json({ code: -2, message: "error" });
      } else if (db_result == true) {
        //데이터 삽입 성공
        // console.log(db_result);
        res.json({ code: 1, message: "success" });
      }
    });

    // 영업 시간 설정
    // db.business_hours_select(
    //   userID,
    //   m_s_h,
    //   m_s_m,
    //   m_f_h,
    //   m_f_m,
    //   sa_s_h,
    //   sa_s_m,
    //   sa_f_h,
    //   sa_f_m,
    //   su_s_h,
    //   su_s_m,
    //   su_f_h,
    //   su_f_m
    // ).then(function (setting) {
    //   if (setting == true) {
    //     res.json({ area: "setting", code: 1, message: "hours success" });
    //   } else {
    //     res.json({ area: "setting", code: 0, message: "hours fail" });
    //   }
    // });
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
  const { id } = req.query;
  console.log("#####", id);
  // console.log("쿠키: ", id);
  res.render("main");
  // console.log("메인 세션: ", req.session.userID);
});

router.post("/main", (req, res, next) => {
  const { userID } = req.body;
  // db에서 확인
  // db.seating(id, pw, name, email, r_name);
  // #회원가입 성공 시
  // res.json({ code: 0, session: "sampleSession1" });
  // # 실패하면
  // res.json({code: 1, message: ''})
  // res.send("success");
});

// 로그아웃
// router.get("/logout", function (req, res) {
//   console.log("로그아웃 전 세션: ");
//   delete req.session.userID;

//   req.session.save(function () {
//     res.redirect("/main");
//     //console.log("로그아웃후 세션: ", req.session.userID);
//   });
// });

router.post("/logout", (req, res) => {
  res.send("success");
});

// router.get("/getTime", (req, res) => {
//   db.testDate().then((finishDate) => {
//     console.log(typeof finishDate, finishDate[0].finishDate);
//     const date = finishDate[0].finishDate;

//     // console.log(Object.keys(date));

//     const now = new Date();
//     const finish = new Date(date);
//     const finishMilli = finish.getTime();
//     const nowMili = now.getTime();
//     const gapMilli = finishMilli - nowMili;

//     const gapMinutes = gapMilli / (60 * 1000);
//     console.log(gapMinutes);
//   });
// });

router.post("/management2", (req, res, next) => {
  const {
    cookie,
    m_s_h,
    m_s_m,
    m_f_h,
    m_f_m,
    sa_s_h,
    sa_s_m,
    sa_f_h,
    sa_f_m,
    su_s_h,
    su_s_m,
    su_f_h,
    su_f_m,
  } = req.body;

  // db에서 확인
  db.cookieToID(cookie).then(function (result) {
    var userID = result; //coookie에서 userID가져옴

    db.business_hours_select(
      userID,
      m_s_h,
      m_s_m,
      m_f_h,
      m_f_m,
      sa_s_h,
      sa_s_m,
      sa_f_h,
      sa_f_m,
      su_s_h,
      su_s_m,
      su_f_h,
      su_f_m
    ).then(function (setting) {
      if (setting == true) {
        res.json({ area: "setting", code: 2, message: "hours success" });
      } else {
        res.json({ area: "setting", code: 3, message: "hours fail" });
      }
    });
  });
});

module.exports = router; // 모듈로 만드는 부분
