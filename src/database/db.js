const pool = require("./config");
const fs = require("fs");
const { listenerCount } = require("events");
const { nextTick } = require("process");
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require("constants");
const { ifError } = require("assert");

/*1. 회원가입, 로그인, 쿠키, 세션*/

//세션 (조회)
const session_select = async function (userID) {
  try {
    const query = `select * from sessions where userID = '${userID}'`; //세션에 동일한 id가 있는지 조회
    //console.log(query);
    const result = await pool.query(query);

    const queryResult = result[0][0];
    //console.log(result[0][0]);

    if (queryResult == undefined) {
      //테이블이 비어있으면
      var ran = Math.random().toString(36).substr(2, 11);
      session_insert(userID, ran);
      return ran;
    } else if (userID == queryResult.userID) {
      //세션이 있으면
      var ran = Math.random().toString(36).substr(2, 11);
      session_update(userID, ran);
      return ran;
    } else {
      //세션이 없으면
      var ran = Math.random().toString(36).substr(2, 11);
      session_insert(userID, ran);
      return ran;
    }
  } catch (e) {
    console.log("Error in session_select\n", e);
    return false;
  }
};

//세션 (삽입)
const session_insert = async function (userID, ran) {
  try {
    const query = `insert into sessions values('${ran}', '${userID}')`; //세셥 삽입
    const result = await pool.query(query);
    console.log(query);
  } catch (e) {
    console.log("Error in session_insert\n", e);
    return false;
  }
};

//세션 (업데이트)
const session_update = async function (userID, ran) {
  try {
    const query = `update sessions set session = '${ran}' where userID = '${userID}'`;
    const result = await pool.query(query);
    console.log("세션 업데이트 성공");
  } catch (e) {
    console.log("Error in session_update\n", e);
    return false;
  }
};

//쿠키 -> 아이디 검색
const cookieToID = async function (cookie) {
  try {
    const query = `select * from sessions where session = '${cookie}'`;
    // console.log(query);
    const result = await pool.query(query);
    const queryResult = result[0][0];

    var userID = queryResult.userID;
    // console.log("cookie를 userID로 바꾸면: ", userID);
    return userID;
  } catch (e) {
    console.log("Error in cookieToID\n", e);
    return false;
  }
};

//로그인
const login = async function (userID, userPassword) {
  try {
    const query = `SELECT * FROM USER_WEB WHERE userID = '${userID}'`;
    //console.log(query);

    const result = await pool.query(query);
    //console.log("###", result[0][0].userPassword);
    // 얘는 배열
    const queryResult = result[0][0];

    if (userID.length === 0 || userPassword.length === 0) {
      console.log("입력X");
      return -1; //입력X
    } else if (
      queryResult.userID == userID &&
      queryResult.userPassword == userPassword
    ) {
      var user_session = session_select(userID);
      return user_session; //로그인 성공 - 사용자의 세션값을 router.post("/login")으로 넘겨줌
    } else {
      console.log("비밀번호 불일치");
      return false; //비밀번호 불일치
    }
  } catch (e) {
    console.log("Error in login\n", e);
    return false;
  }
};

// 회원가입 (중복되는 아이디가 있는지 체크)
const join_check = async function (userID, userEmail, r_name) {
  try {
    const query = `SELECT * FROM USER_WEB`;

    const result = await pool.query(query);

    const q_len = result[0].length;

    for (var i = 0; i < q_len; i++) {
      const queryResult = result[0][i];

      if (
        i == q_len - 1 &&
        queryResult.userID != userID &&
        queryResult.userEmail != userEmail &&
        queryResult.r_name != r_name
      ) {
        //중복되는 아이디, 이메일, 가게이름이 회원테이블에 없을때
        // console.log("join_check 가능");
        return true;
      } else if (
        //db테이블에 하나라도 중복되는 사항이 있으면
        queryResult.userID == userID ||
        queryResult.userEmail == userEmail ||
        queryResult.r_name == r_name
      ) {
        // console.log("join_check 중복");
        return -1;
      }
    }
  } catch (e) {
    console.log("Error in join\n", e);
    return false;
  }
};

//회원가입 (db에 정보 추가)
const join = async function (
  userID,
  userPassword,
  userName,
  userEmail,
  r_name
) {
  try {
    const query = `INSERT INTO USER_WEB VALUES ('${userID}', '${userPassword}', '${userName}', '${userEmail}', '${r_name}')`;
    //console.log(query);

    const result = await pool.query(query);
    console.log("성공");

    return true;
  } catch (e) {
    console.log("Error in join\n", e);
    return false;
  }
};

/*2. 메인페이지*/

//메인페이지 - 테이블 위치값 받아오기
const table_select = async function (userID) {
  table_list = [];
  try {
    const query = `SELECT x,y FROM table_location WHERE userID = '${userID}'`;
    // console.log(query);
    const result = await pool.query(query);

    for (var i = 0; i < result[0].length; i++) {
      var x = result[0][i].x;
      var y = result[0][i].y;

      var pot = { x, y };
      table_list.push(pot);
    }
    return table_list;
  } catch (e) {
    console.log("Error in table_location\n", e);
    return false;
  }
};

//메인페이지 - 창문 위치값 받아오기
const window_select = async function (userID) {
  window_list = [];
  try {
    const query = `SELECT x,y FROM window_location WHERE userID = '${userID}'`;
    //console.log(query);
    const result = await pool.query(query);

    for (var i = 0; i < result[0].length; i++) {
      var x = result[0][i].x;
      var y = result[0][i].y;
      // console.log("x: ", x);
      var pot = { x, y };
      // console.log("window: ", window);
      window_list.push(pot);
    }
    // console.log("window_list: ", window_list);
    return window_list;
  } catch (e) {
    console.log("Error in window_location\n", e);
    return false;
  }
};

//메인페이지 - 테이블 별 주문 메뉴 조회하기
const table_menu_select = async function (userID, table_num) {
  order_list = [];
  try {
    const query = `SELECT * FROM table_menu WHERE userID = '${userID}' and table_num = '${table_num}'`;
    const result = await pool.query(query);

    for (var i = 0; i < result[0].length; i++) {
      var menu_name = result[0][i].menu_name;
      var menu_len = result[0][i].menu_len;
      var menu_id = result[0][i].menu_id;
      var order = { menu_name, menu_len, menu_id };

      order_list.push(order);
    }

    return order_list;
  } catch (e) {
    console.log("Error in table_menu_select\n", e);
    return false;
  }
};

//메인페이지 - 테이블 별 주문 메뉴 삭제하기
const table_menu_delete = async function (userID, table_num) {
  try {
    const query = `DELETE FROM table_menu WHERE userID = '${userID}' and table_num = '${table_num}'`;
    console.log(query)
    const result = await pool.query(query);
    return true;
  } catch (e) {
    console.log("Error in table_menu_delete\n", e);
    return false;
  }
};
//메인페이지 - 테이블 별 주문 메뉴 저장하기
const table_menu_save = async function (userID, table_num, order_list) {
  try {
    for(i=0; i < order_list.length; i++){
      var menu = order_list[i][0];
      var menu_len = order_list[i][1];
      var menu_id = order_list[i][2];
      const query = `insert into table_menu(userID, table_num, menu_name, menu_len, menu_id) values('${userID}', '${table_num}', '${menu}', '${menu_len}', '${menu_id}');`;
      const result = await pool.query(query);
    }
    // console.log("window_list: ", window_list);
    return true;
  } catch (e) {
    console.log("Error in table_menu_save\n", e);
    return false;
  }
};

/* 3. 주문 접수*/

//주문 접수 - 주문 목록 조회
const orders = async function (userID, last) {
  var order_list = [];
  try {
    // console.log("###", last);
    const query = `select * FROM orders WHERE userID = '${userID}' and r_id > '${last}' and (acceCan is null or acceCan = 1)`;
    // console.log(query);
    const result = await pool.query(query);
    // console.log("orders: ", result[0][0]);

    for (var i = 0; i < result[0].length; i++) {
      var menu = result[0][i].menu;
      var personNum = result[0][i].personNum;
      var seatNum = result[0][i].seatNum;
      var number = result[0][i].r_id; //접수번호
      var acceCan = result[0][i].acceCan; //접수or취소

      if (acceCan == null) {
        acceCan == 2;
      }

      var order = [number, menu, personNum, seatNum, acceCan];

      order_list.push(order);
      order = [];
    }
    // console.log(order_list);
    return order_list;
  } catch (e) {
    console.log("Error in orders\n", e);
    return false;
  }
};

//주문 접수 - 접수 수락 업데이트
const orders_submit = async function (userID, submit_num) {
  try {
    const query = `update orders set acceCan = 1 where userID ='${userID}' and r_id = ${submit_num};`;
    // console.log(query);
    const result = await pool.query(query);
    // console.log("orders_submit: ", result[0][0]);
    return true;
  } catch (e) {
    console.log("Error in orders_submit\n", e);
    return false;
  }
};

//주문 접수 - 접수 취소 업데이트
const orders_acc = async function (userID, acc_num, reason_num) {
  try {
    const query = `update orders set acceCan = 0, reason_num = ${reason_num} where userID ='${userID}' and r_id = ${acc_num};`;
    // console.log(query);
    const result = await pool.query(query);
    // console.log("orders_acc: ", result[0][0]);
    return true;
  } catch (e) {
    console.log("Error in orders_acc\n", e);
    return false;
  }
};

/*4. 매장관리 - 영업 임시 중지*/

//매장관리 - 영업 임시 중지 (해당 가게의 데이터가 있는지 확인)
const business_stop_select = async function (userID, tem_stop_time) {
  try {
    const query = `SELECT * FROM business_stop WHERE userID = '${userID}'`;
    // console.log(query);
    const result = await pool.query(query);
    const queryResult = result[0][0];

    if (queryResult == undefined) {
      //해당 가게의 데이터가 없다면
      const timer = business_stop_insert(userID, tem_stop_time);
      return true;
    } else {
      //해당가게의 데이터가 이미 있으면
      return -1;
    }
  } catch (e) {
    console.log("Error in business_stop_select\n", e);
    return false;
  }
};

//매장관리 - 영업 임시 중지 (조회->화면에 보여줌)
const business_select = async function (userID) {
  try {
    const query = `SELECT * FROM business_stop WHERE userID = '${userID}'`;
    const result = await pool.query(query);
    const queryResult = result[0][0];
    // console.log("#:", queryResult);
    return queryResult;
  } catch (e) {
    console.log("Error in business_stop_select\n", e);
    return false;
  }
};

//매장관리 - 영업 임시 중지 (데이터 삽입)
const business_stop_insert = async function (userID, tem_stop_time) {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const addMilli = tem_stop_time * 60 * 1000;
    const finishMilli = now.getTime() + addMilli; //일정시간 뒤의 시간을 밀리초로 나타냄
    // console.log("밀리초:", finishMilli);

    const finish = new Date(finishMilli);
    var finish_t =
      finish.getHours() + ":" + finish.getMinutes() + ":" + finish.getSeconds();
    // console.log("밀리초 변환:", finish_t);

    const finishDate = year + "-" + month + "-" + date + " " + finish_t;
    const query = `INSERT INTO business_stop (userID, finishDate) VALUES('${userID}','${finishDate}')`;
    const result = await pool.query(query);
    const queryResult = result[0][0];

    // Number(tem_stop_time) * 1000 * 60);

    setTimeout(function () {
      console.log("ddd");
      business_stop_delete(userID);
    }, Number(tem_stop_time) * 1000);

    return true;
  } catch (e) {
    console.log("Error in business_stop_insert\n", e);
    return false;
  }
};

//매장 관리 - 영업 임시 중지 (일정 시간후 삭제)
const business_stop_delete = async function (userID) {
  try {
    const query = `DELETE FROM business_stop WHERE userID = '${userID}'`;
    // console.log(query);
    const result = await pool.query(query);
    const queryResult = result[0][0];
    // console.log("delete: ", queryResult);
    if (queryResult == undefined) {
      return 1;
    }
  } catch (e) {
    console.log("Error in business_stop_delete\n", e);
    return false;
  }
};

/*5. 매장관리 - 영업시간 설정*/

//매장 관리 - 영업시간 설정 - 영업 시간 조회
const business_hours_select_check = async function (userID) {
  try {
    const query = `SELECT * FROM business_hours WHERE userID = '${userID}'`;
    // console.log(query);
    const result = await pool.query(query);
    const queryResult = result[0][0];
    // console.log("####", queryResult);
    if (queryResult == undefined) {
      //해당 가게의 데이터가 없다면
      return 0;
    } else {
      //해당가게의 데이터가 이미 있으면
      return queryResult;
    }
  } catch (e) {
    console.log("Error in business_stop_select\n", e);
    return false;
  }
};

//매장 관리 - 영업시간 설정 (삽입이나 업데이트 위한 영업 시간 조회)
const business_hours_select = async function (
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
) {
  try {
    const query = `SELECT * FROM business_hours WHERE userID = '${userID}'`;
    // console.log(query);
    const result = await pool.query(query);
    const queryResult = result[0][0];
    // console.log("####", queryResult);
    if (queryResult == undefined) {
      //해당 가게의 데이터가 없다면
      business_hours_insert(
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
      );
      return true;
    } else {
      //해당가게의 데이터가 이미 있으면
      business_hours_update(
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
      );
      return true;
    }
  } catch (e) {
    console.log("Error in business_stop_select\n", e);
    return false;
  }
};

//매장 관리 - 영업시간 설정 (영업 시간 삽입)
const business_hours_insert = async function (
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
) {
  try {
    const query = `INSERT INTO business_hours (userID, m_s_h, m_s_m, m_f_h, m_f_m, sa_s_h, sa_s_m, sa_f_h,sa_f_m,su_s_h,su_s_m,su_f_h,su_f_m) VALUES('${userID}','${m_s_h}', '${m_s_m}', '${m_f_h}', '${m_f_m}', '${sa_s_h}', '${sa_s_m}', '${sa_f_h}','${sa_f_m}','${su_s_h}','${su_s_m}','${su_f_h}','${su_f_m}')`;
    // console.log(query);
    const result = await pool.query(query);
    const queryResult = result[0][0];
    // console.log("####insert결과", queryResult);
    return true;
  } catch (e) {
    console.log("Error in business_hours_insert\n", e);
    return false;
  }
};

//매장 관리 - 영업시간 설정 (영업 시간 업데이트)
const business_hours_update = async function (
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
) {
  try {
    const query = `update business_hours set m_s_h = '${m_s_h}', m_s_m = '${m_s_m}', m_f_h = '${m_f_h}', m_f_m = '${m_f_m}', sa_s_h = '${sa_s_h}', sa_s_m = '${sa_s_m}', sa_f_h = '${sa_f_h}', sa_f_m = '${sa_f_m}', su_s_h = '${su_s_h}', su_s_m = '${su_s_m}', su_f_h = '${su_f_h}', su_f_m = '${su_f_m}' where userID = '${userID}'`;
    // console.log(query);
    const result = await pool.query(query);
    const queryResult = result[0][0];
    // console.log("####update결과", queryResult);
    return true;
  } catch (e) {
    console.log("Error in business_hours_update\n", e);
    return false;
  }
};

/*6. 매장관리 - 휴무일 설정*/

//매장 관리 - 휴무일 설정 (저장)
const business_holiday = async function (userID, reg_item, tem_item) {
  try {
    // console.log("####reg_item", reg_item)
    const query = `SELECT * FROM holiday WHERE userID = '${userID}'`;
    //console.log(query);
    const result = await pool.query(query);
    const queryResult = result[0][0];
    if(queryResult == undefined){
      business_holiday_insert(userID, reg_item, tem_item);
      return true;
    }else{
      business_holiday_update(userID, reg_item, tem_item);
      return true;
    }
  } catch (e) {
    console.log("Error in business_holiday\n", e);
    return false;
  }
};

//매장 관리 - 휴무일 삽입
const business_holiday_insert = async function (userID, reg_item, tem_item){
  try{
    const query = `insert into holiday (userID, regulary, temporary) VALUES ('${userID}','${reg_item}', '${tem_item}')`;
    const result = await pool.query(query);
    const queryResult = result[0][0];
  }catch(e){
    console.log("Error in business_holiday_insert\n", e);
  }
};

//매장 관리 - 휴무일 업데이트
const business_holiday_update = async function (userID, reg_item, tem_item){
  try{
    const query = `update holiday set regulary = '${reg_item}', temporary = '${tem_item}' where userID = '${userID}'`;
    const result = await pool.query(query);
    const queryResult = result[0][0];
  }catch(e){
    console.log("Error in business_holiday_update\n", e);
  }
};

//매장 관리 - 휴무일 설정 (조회)
const business_holiday_select = async function (userID) {
  try {
    // console.log("####reg_item", reg_item)
    const query = `SELECT * FROM holiday WHERE userID = '${userID}'`;
    const result = await pool.query(query);
    const queryResult = result[0][0];
    if (queryResult == undefined) {
      //해당 가게의 데이터가 없다면
      return 0;
    } else {
      //해당가게의 데이터가 이미 있으면
      return queryResult;
    }
  } catch (e) {
    console.log("Error in business_holiday_select\n", e);
    return false;
  }
};


// const testDate = async () => {
//   try {
//     const query = `select finishDate from datetesttable`;
//     // console.log(query);
//     const [result, _] = await pool.query(query);
//     console.log(result);
//     return result;
//     // const queryResult = result[0][0];
//     // console.log("delete: ", queryResult);
//     if (queryResult == undefined) {
//       return 1;
//     }
//   } catch (e) {
//     console.log("Error in test\n", e);
//     return false;
//   }
// };

/*7. 매장관리 - 좌석 배치도 변경*/

//매장관리 - 좌석 배치도 변경 - 테이블 조회
const table_location = async function (userID, table_save) {
  try {
    const query = `SELECT * FROM table_location WHERE userID = '${userID}'`;
    //console.log(query);
    const result = await pool.query(query);
    const queryResult = result[0][0];

    if (queryResult == undefined) {
      //해당 가게의 데이터가 없다면
      return true;
    } else {
      //해당가게의 데이터가 이미 있으면
      return 0;
    }
  } catch (e) {
    console.log("Error in table_location\n", e);
    return false;
  }
};

//매장관리 - 좌석 배치도 변경 - 테이블 삽입
const table_insert = async function (userID, table_save) {
  try {
    // console.log("table_insert에서 table_save값:", table_save);
    for (var i = 0; i < table_save.length; i++) {
      var x = table_save[i][0];
      var y = table_save[i][1];
      const query = `insert into table_location(userID, x, y) values('${userID}','${x}','${y}')`;
      // console.log("테이블 ", i, "번째", query);
      const result = await pool.query(query);
      // const queryResult = result[0][0];
      // console.log(i + "번째 쿼리 결과: ", queryResult);
    }
    return true;
  } catch (e) {
    console.log("Error in table_insert\n", e);
    return false;
  }
};

//매장관리 - 좌석 배치도 변경 - 창문 조회
const window_location = async function (userID, window_save) {
  try {
    const query = `SELECT * FROM window_location WHERE userID = '${userID}'`;
    //console.log(query);
    const result = await pool.query(query);
    const queryResult = result[0][0];

    if (queryResult == undefined) {
      //해당 가게의 데이터가 없다면
      return true;
    } else {
      //해당가게의 데이터가 이미 있으면
      return 0;
    }
  } catch (e) {
    console.log("Error in window_location\n", e);
    return false;
  }
};

//매장관리 - 좌석 배치도 변경 - 창문 삽입
const window_insert = async function (userID, window_save) {
  try {
    // console.log("window_insert에서 window_save값:", window_save);
    for (var i = 0; i < window_save.length; i++) {
      var x = window_save[i][0];
      var y = window_save[i][1];
      const query = `insert into window_location(userID, x, y) values('${userID}','${x}','${y}')`;
      // console.log("창문 ", i, "번째", query);
      const result = await pool.query(query);
      // const queryResult = result[0][0];
    }
    return true;
  } catch (e) {
    console.log("Error in window_insert\n", e);
    return false;
  }
};

//매장관리 - 좌석 배치도 변경 - 좌석 배치도 삭제 -table
const table_clear = async function (userID) {
  try {
    const query = `delete from table_location where userID = '${userID}'`;
    // console.log(query);
    const result = await pool.query(query);
    const queryResult = result[0][0];
    // console.log("delete: ", queryResult);
    return true;
  } catch (e) {
    console.log("Error in table_clear\n", e);
    return false;
  }
};

//매장관리 - 좌석 배치도 변경 - 좌석 배치도 삭제 -window
const window_clear = async function (userID) {
  try {
    const query = `delete from window_location where userID = '${userID}'`;
    // console.log(query);
    const result = await pool.query(query);
    const queryResult = result[0][0];
    // console.log("delete: ", queryResult);
    return true;
  } catch (e) {
    console.log("Error in window_clear\n", e);
    return false;
  }
};

/* 8.매장 관리 - 메뉴 설정*/

//매장 관리 - 메뉴 설정 - 메뉴 추가
const menu_add = async function (userID, img, menu_title, menu_price, menu_ex) {
  try {
    const query = `insert into menu(userID, img, title, price, ex) values ('${userID}','${img}','${menu_title}',${menu_price},'${menu_ex}' )`;
    // console.log("###", query);
    const result = await pool.query(query);
    // const queryResult = result[0][0];
    // console.log("img insert", queryResult);
    return true;
  } catch (e) {
    console.log("Error in menu_add\n", e);
    return false;
  }
};

//매장 관리 - 메뉴 설정 - 메뉴 조회
const menu_select = async function (userID) {
  menu_list = [];
  try {
    const query = `SELECT img,title,price,ex FROM menu WHERE userID = '${userID}'`;
    // console.log(query);
    const result = await pool.query(query);

    for (var i = 0; i < result[0].length; i++) {
      const buffer = Buffer.from(result[0][i].img, "base64");
      var img = buffer.toString();
      var title = result[0][i].title;
      var price = result[0][i].price;
      var ex = result[0][i].ex;

      var menu_select = { img, title, price, ex };
      menu_list.push(menu_select);
    }
    return menu_list;
  } catch (e) {
    console.log("Error in menu_select\n", e);
    return false;
  }
};

//매장 관리 - 메뉴 설정 - 메뉴 삭제
const menu_delete = async function (userID, title) {
  try {
    const query = `delete from menu where userID = '${userID}' and title = '${title}'`;
    // console.log(query);
    const result = await pool.query(query);

    return true;
  } catch (e) {
    console.log("Error in menu_delete\n", e);
    return false;
  }
};

module.exports = {
  // (세션, 로그인, 회원가입)
  session_select, //세션 조희
  session_insert, //세션 삽입
  session_update, //세션 업데이트
  cookieToID, //쿠키 -> 아이디
  login, //로그인
  join, //회원가입
  join_check, //회원가입 (중복 체크)
  // (메인페이지)
  table_select, //테이블 위치값 받아오기
  window_select, //창문 위치값 받아오기
  table_menu_select,  //테이블 별 주문 메뉴 조회
  table_menu_delete, //테이블 별 주문 메뉴 삭제
  table_menu_save, //테이블 별 주문 메뉴 저장

  // 주문접수
  orders, //주문 목록 조회
  orders_submit, //주문 수락 업데이트
  orders_acc, //주문 취소 업데이트

  // 매장관리 - 영업 일시 중지
  business_stop_select, //영업 임시 중지 데이터 조회
  business_select, //남은 시간 조회
  business_stop_insert, //임시 중지 데이터 삽입
  business_stop_delete, //임시 중지 데이터 삭제 시간이 흐른 후 삭제

  // 매장관리 - 영업 시간 설정
  business_hours_select_check, //영업 시간 조회 - 표시
  business_hours_select, //영업 시간 조회 - 삽입/업데이트
  business_hours_insert, //영업 시간 삽입
  business_hours_update, //영업 시간 업데이트

  // 매장관리 - 휴무일 설정
  business_holiday, //휴무일 저장
  business_holiday_insert,  //휴무일 삽입
  business_holiday_update,  //휴무일 업데이트
  business_holiday_select,  //휴무일 조회

  // 매장관리 - 좌석배치도 변경
  table_location, //테이블 조회
  table_insert, //테이블  삽입
  table_clear, //테이블 삭제

  window_location, //창문 조회
  window_insert, //창문 삽입
  window_clear, //창문 삭제

  // 매장관리 - 메뉴설정
  menu_add, //메뉴 추가
  menu_select, //메뉴 조회
  menu_delete, //메뉴 삭제
};
