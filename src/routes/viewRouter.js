const { json } = require("express");
const express = require("express");
const path = require("path");
const { features } = require("process");

const router = express.Router(); // 라우터 분리

const db = require("../database/db");

// 로그인!
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

// 로그아웃
router.post("/logout", (req, res) => {
  res.send("success");
});

// 회원가입!
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
    } else {  //db.joincheck result = flase일때
      res.json({ code: 1, msg: "join_check error" }); //code: 1; db.joincheck 에러
    }
  });
});

// 메인
router.get("/main", (req, res, next) => {
  // const { id } = req.query;
  res.render("main");
  // console.log("메인 세션: ", req.session.userID);
});

// 메인 - POST !
router.post("/main", async (req, res, next) => {
  const { cookie } = req.body;
  const userID = await db.cookieToID(cookie);
  // console.log("userID: ", userID )
  var table = await db.table_select(userID); //테이블 위치
  var window = await db.window_select(userID); //창문 위치

  var pos_menu = await db.menu_select(userID); //해당 가게의 menu 
  var select = await db.table_menu_select_main(userID); //가게에 등록된 menu 이름 + 개수 받아옴

  var reser = await db.orders_reser(userID);
  // console.log("reser: ", reser)
  // console.log(window);
  res.json({ table: table, window: window, pos_menu: pos_menu, main_table_menu: select, reserved: reser});
});

// 메인 - POST
router.post("/main_reserved", async (req, res, next) => {
  const { cookie, table_num, order } = req.body;
  const userID = await db.cookieToID(cookie);

  var save = await db.table_menu_save(userID, table_num, order); //예약석 메뉴 저장하기

  console.log("result: ", save)
  // console.log(window);
  res.json({ code: 0, msg: "success!"});
});

// 메인 페이지 포스기 테이블 메뉴 불러오기!
router.post("/pos_order_sele", async (req, res, next) => {
  const { cookie, table_num} = req.body;
  const userID = await db.cookieToID(cookie);

  // console.log("order_list: ", order_list);
  
  var table_sele = await db.table_menu_select(userID, table_num);

  if(table_sele != false){
    res.json({ code: 0, order_list: order_list });
  }else{
    res.json({ code: -1, msg: "pos_order fail" });
  }
});

// 메인 페이지 포스기 테이블 메뉴 저장!
router.post("/pos_order", async (req, res, next) => {
  const { cookie, table_num, order_list } = req.body;
  const userID = await db.cookieToID(cookie);

  // console.log("order_list: ", order_list);
  
  var table_delete = await db.table_menu_delete(userID, table_num);

  if(table_delete == true){
    var table_save = await db.table_menu_save(userID,table_num,order_list); //테이블 별 주문 메뉴 저장
    if(table_save == true){
      res.json({ code: 1, msg: "pos_order success" });
    }else{
      res.json({ code: -1, msg: "pos_order fail" });
    }
  }else{
    res.json({ code: -1, msg: "pos_order fail" });
  }
});

// 메인 페이지 포스기 결제!
router.post("/pay", async (req, res, next) => {
  const { cookie, table_num, order_list} = req.body;
  const userID = await db.cookieToID(cookie);
  

  var table_save = await db.table_menu_save(userID,table_num,order_list); //테이블 별 주문 메뉴 저장
  var table_dele = await db.table_menu_delete(userID, table_num);
  
  if(table_save == true && table_dele == true){
    res.json({ code: 1, msg: "pay success" });
  }else{
    res.json({ code: -1, msg: "pay fail" });
  }
});

// 주문접수!
router.get("/orders", (req, res) => {
  const { id } = req.query;
  // console.log("order 쿠키: ", id);
  db.cookieToID(id).then(function (result) {
    var userID = result; //coookie에서 userID가져옴
    db.orders(userID,0).then(function (result) {
      // console.log(order_list);
      res.render("orders");
    });
  });
});

//주문 접수 목록 계속 조회 -> 나타내기!
router.get("/ordersData", (req, res) => {
  const { id, last } = req.query;
  // console.log("last:", last);
  // console.log("id", id);
  db.cookieToID(id, last).then(function (id) {
    const userID = id;
    db.orders(userID, last).then(function (result_list) {
      // console.log("##", result_list);
      res.json({ list: result_list }); //문자나 문자열을 보낼때
    });
  });

  // res.render({ arr1: [{ a: 1, b: 2 }, "abcd"] });
});

//주문 접수 수락 보내기!
router.post("/orders_submit", (req, res) => {
  const { cookie, submit_num } = req.body;

  db.cookieToID(cookie).then(function (id) {
    const userID = id;
    
    db.orders_submit(userID, submit_num).then(function (submit_result) {
      if (submit_result == true) {
        res.json({ code: 1, message: "orders_submit success" });
      } else {
        res.json({ code: 0, message: "orders_submit fail" });
      }
    });
  });
  // console.log(req.body);
});

//주문 접수 취소 보내기!
router.post("/order_cancel", (req, res) => {
  const { cookie, acc_num, reason_num } = req.body;
  // console.log("##", reason_num);
  db.cookieToID(cookie).then(function (id) {
    const userID = id;
    db.order_cancel(userID, acc_num, reason_num).then(function (acc_result) {
      if (acc_result == true) {
        res.json({ code: 1, message: "orders_acc success" });
      } else {
        res.json({ code: 0, message: "orders_acc fail" });
      }
    });
  });
  // console.log(req.body);
});

//매장 관리 - 영업 시간, 휴무일 조회!
router.post("/business", async (req, res) => {
  const { cookie } = req.body;
  const userID = await db.cookieToID(cookie);

  var hours = await db.business_hours_select_check(userID);
  var holiday = await db.business_holiday_select(userID);
  if (hours != 0) {
    if(holiday != 0){
      res.json({ code: 1, hours: hours, holiday: holiday }); //영업시간과 휴무일이 설정되어 있을때
    } else{
      res.json({ code: 2, hours: hours}); //영업시간만 설정되어 있을때
    }
  } else if(hours == 0 && holiday != 0){
    res.json({ code: 3, holiday: holiday}); //휴무일만 설정되어 있을때
  } else if(hours == 0 && holiday == 0){
    res.json({ code: 0}); //설정된게 없을때
  }
});

// 매장관리 - 영업 임시 중지 - 남은 시간 조회!
router.get("/management", (req, res, next) => {
  // console.log("차이: ", gap); //최종 차이(분 단위)

  const { id } = req.query;
  // res.render("management");
  db.cookieToID(id).then(function (result) {
    var userID = result; //coookie에서 userID가져옴

    //영업 중지시간 찾아서 보여줌
    db.business_select(userID).then(function (re_time) {
      if (re_time == undefined || re_time == false) {
        res.render("management", { remain: 0 });
      } else {
        const now = new Date();
        const date = re_time.finish_date; //db에서 finishDate에 접근해서 날짜,시간 받아오기
        const finish = new Date(date); //db시간을 읽어오기위해 객체에 저장하기
        const finishMilli = finish.getTime(); //db저장값 밀리초로 받아오기
        const nowMili = now.getTime(); //현재 시간 밀리초로 받아오기
        const gapMilli = finishMilli - nowMili; //차이 계산
        const gapMinutes = gapMilli / (60 * 1000); //분으로 바꾸기
        const gap = Math.round(gapMinutes);
        
        // console.log("결과값", re_time);
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

    //영업 일시 정지
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
  });
});

//매장 관리 - 영업 시간 설정!
router.post("/business_hours_set", (req, res, next) => {
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
      // console.log("setting: ", setting)
      if (setting == true) {
        res.json({ code: 2, message: "hours success" });
      } else {
        res.json({ code: 3, message: "hours fail" });
      }
    });
  });
});

//매장 관리 - 휴무일 설정!
router.post("/management_holiday", async (req, res) => {
  const { cookie, reg_item, tem_item } = req.body;

  const userID = await db.cookieToID(cookie);
  const save = await db.business_holiday(userID, reg_item, tem_item);

  if(save == true){
    res.json({code: 1, message: "holiday save success"});
  }else{
    res.json({code: 0, message: "holiday save failed"})
  }
});

// 좌석배치도!
router.get("/seating", (req, res, next) => {
  res.render("seating");
});
router.post("/seating", async (req, res, next) => {
  const { cookie, window_save, table_save } = req.body;
  // console.log("window_save", window_save.length);
  // db에서 확인
  const userID = await db.cookieToID(cookie);

  const already_table = await db.table_location(userID);
  const already_window = await db.window_location(userID);

  if (already_table == true && already_window == true) {
    // 처음 저장
    console.log(already_table, already_window);
    await db.table_insert(userID, table_save);
    await db.window_insert(userID, window_save);
    res.json({ code: 1, message: "seating_save success" });
  } else {
    // 이미 있는 경우
    await db.table_clear(userID);
    await db.window_clear(userID);
    await db.table_insert(userID, table_save);
    await db.window_insert(userID, window_save);
    res.json({ code: 0, message: "seating_update success" });
  }
});

//좌석배치도 - 모두 삭제!
router.post("/location_clear", async (req, res, next) => {
  const { cookie } = req.body;

  const userID = await db.cookieToID(cookie);

  var table_clear = await db.table_clear(userID);
  var window_clear = await db.window_clear(userID);

  if (table_clear == true && window_clear == true) {
    res.json({ code: 1, message: "location_delete success" });
  } else {
    res.json({ code: 0, message: "location_delete error" });
  }
});

//매장 관리 - 메뉴 설정- 사진 등록 !
router.get("/menusetting", (req, res) => {
  res.render("menusetting", { arr1: [{ a: 1, b: 2 }, "abcd"] });
});

router.post("/menusetting", async (req, res) => {
  const { cookie, img_base64, menu_title, menu_price, menu_ex } = req.body;
  // console.log(img_base64);
  var img = img_base64.substring(22); //data:image/png;base64, 빼기

  // var matches = img_base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

  // console.log("#####", matches);

  const userID = await db.cookieToID(cookie);
  var menu_add = await db.menu_add(
    userID,
    img,
    menu_title,
    menu_price,
    menu_ex
  );
  var menu_list = await db.menu_select(userID);

  if (menu_add == true) {
    res.json({ code: 1, menu: menu_list });
  } else if (menu_add == false && menu_list != null) {
    res.json({ code: 0 });
  }
});

//매장 관리 - 메뉴 설정- 메뉴 조회!
router.post("/menusetting_select", (req, res) => {
  const { cookie } = req.body;

  db.cookieToID(cookie).then(function (result) {
    var userID = result; //coookie에서 userID가져옴

    db.menu_select(userID).then(function (select) {
      // var a = select.menu[0].img.data.toString("base64");
      res.json({ menu: select });
    });
  });
});

//매장 관리 - 메뉴 설정- 메뉴 삭제!
router.post("/menusetting_delete", async (req, res) => {
  const { cookie, title } = req.body;
  // console.log("router: ", title);
  const userID = await db.cookieToID(cookie);
  // const delete_check = db.menu_delete(userID, title);
  db.menu_delete(userID, title).then(function (delete_check) {
    if (delete_check == true) {
      res.json({ code: 1 });
    } else {
      res.json({ code: 0 });
    }
  });
});

//매장 관리 - 매장 설정 
// router.get("/restaurantsetting", (req, res) => {
//   res.render("restaurantsetting");
// });

//매장 관리 - 매장 설정 
// router.get("/restaurantsetting", (req, res) => {
//   const { cookie } = req.body;

//   db.cookieToID(cookie).then(function (result) {
//     var userID = result; //coookie에서 userID가져옴
//   });
// });

//매장 관리 - 매장 조회
router.get("/restaurantsetting", (req, res) => {
  res.render("restaurantsetting", { arr1: [{ a: 1, b: 2 }, "abcd"] });
});

router.post("/restaurantsetting", async (req, res) => {
  const { cookie, img_base64, phone, address, category } = req.body;
  // console.log(img_base64);
  var img = img_base64.substring(22); //data:image/png;base64, 빼기

  // var matches = img_base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  
  // console.log("#####", matches);
  
  const userID = await db.cookieToID(cookie);
  
  var restaurant_sumbit = await db.restaurant_sumbit(
    userID,
    img,
    phone,
    address,
    category
    );
    
    var restaurant_list = await db.restaurant_select(userID);
    
    if (restaurant_sumbit == true) {
      res.json({ code: 1, restaurant: restaurant_list });
    } else if(restaurant_sumbit == false && restaurant_list != null) {
      res.json({ code: 0 });
    }
  });

  //매장 관리 - 매장 설정- 매장 설정 조회
  router.post("/restaurantsetting_select", (req, res) => {
    const { cookie } = req.body;
  
    db.cookieToID(cookie).then(function (result) {
      var userID = result; //coookie에서 userID가져옴
  
      db.restaurant_select(userID).then(function (select) {
        // var a = select.menu[0].img.data.toString("base64");
        res.json({ restaurant: select });
        // console.log(select);
      });
    });
  });


//매장 관리 - 매장 관리
// router.post("/restaurantsetting", async (req, res) => {
//   const { cookie, title } = req.body;
//   // console.log("router: ", title);
//   const userID = await db.cookieToID(cookie);
//   // const delete_check = db.menu_delete(userID, title);
//   db.menu_delete(userID, title).then(function (delete_check) {
//     if (delete_check == true) {
//       res.json({ code: 1 });
//     } else {
//       res.json({ code: 0 });
//     }
//   });
// });

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

//매장 관리 - 메뉴 설정- 사진 등록
// router.get("/setImg", (req, res) => {
//   res.render("imgTest");
// });
// router.post("/setImg", (req, res) => {
//   const { text, img } = req.body;

//   console.log(req.body);

//   res.send("success");
// });

module.exports = router; // 모듈로 만드는 부분