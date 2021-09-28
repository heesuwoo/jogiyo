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
    const query = `select * from sessions where user_id = '${userID}'`; //세션에 동일한 id가 있는지 조회
    //console.log(query);
    const result = await pool.query(query);

    const queryResult = result[0][0];
    //console.log(result[0][0]);

    if (queryResult == undefined) {
      //테이블이 비어있으면
      var ran = Math.random().toString(36).substr(2, 11);
      session_insert(userID, ran);
      console.log("빈테이블 세션 삽입")
      return ran;
    } else if (userID == queryResult.user_id) {
      //세션이 있으면
      var ran = Math.random().toString(36).substr(2, 11);
      session_update(userID, ran);
      console.log("세션 존재, 업데이트")
      return ran;
    } else {
      //세션이 없으면
      var ran = Math.random().toString(36).substr(2, 11);
      session_insert(userID, ran);
      console.log("테이블은 존재하지만 세션값이 없어 삽입")
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

    const query = `insert into sessions(session,user_id) values('${ran}', '${userID}')`; //세셥 삽입
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
    const query = `update sessions set session = '${ran}' where user_id = '${userID}'`;
    const result = await pool.query(query);
    console.log("세션 업데이트 성공");
  } catch (e) {
    console.log("Error in session_update\n", e);
    return false;
  }
};

// 쿠키 -> 아이디 검색
const cookieToID = async function (cookie) {
  try {
    const query = `select * from sessions where session = '${cookie}'`;
    // console.log(query);
    
    if(cookie == undefined){
      userID = 0;
    }else{
      const result = await pool.query(query);
      const queryResult = result[0][0];
      // console.log("queryResult: ", queryResult)
      var userID = queryResult.user_id;
      // console.log("cookie를 userID로 바꾸면: ", userID);
    }
    
    return userID;
  } catch (e) {
    console.log("Error in cookieToID\n", e);
    return false;
  }
};

// restaurant_id -> restaurant_name 검색
const restaurant_idTorestaurant_name = async function (restaurant_id) {
  try {
    const query = `select restaurant_name from user_web where restaurant_id = '${restaurant_id}'`;
    // console.log(query);
    const result = await pool.query(query);
    const queryResult = result[0][0];
    // console.log("queryResult: ", queryResult)
    var restaurant_name = queryResult.restaurant_name;
    console.log("restaurant_id를 restaurant_name으로 바꾸면: ", restaurant_name);
    return restaurant_name;
  } catch (e) {
    console.log("Error in cookieToRestaurant_id\n", e);
    return false;
  }
};

//로그인!
const login = async function (userID, userPassword) {
  try {
    const query = `SELECT * FROM user_web WHERE user_id = '${userID}'`;
    //console.log(query);

    const result = await pool.query(query);
    //console.log("###", result[0][0].userPassword);
    // 얘는 배열
    const queryResult = result[0][0];

    if (userID.length === 0 || userPassword.length === 0) {
      console.log("입력X");
      return -1; //입력X
    } else if (
      queryResult.user_id == userID &&
      queryResult.user_password == userPassword
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

// 회원가입 (중복되는 아이디가 있는지 체크) !
const join_check = async function (userID, userEmail, r_name) {
  try {
    const query = `SELECT user_id, user_email, restaurant_name FROM user_web`;
    console.log(query);
    const result = await pool.query(query);
    const q_len = result[0].length;
    console.log("q_len: ",q_len);

    if(q_len == 0){
      return true
    }else{
      for (var i = 0; i < q_len; i++) {
        const queryResult = result[0][i];

        if (
          i == q_len - 1 &&
          queryResult.user_id != userID &&
          queryResult.user_email != userEmail &&
          queryResult.restaurant_name != r_name
        ) {
          //중복되는 아이디, 이메일, 가게이름이 회원테이블에 없을때
          // console.log("join_check 가능");
          return true;
        } else if (
          //db테이블에 하나라도 중복되는 사항이 있으면
          queryResult.user_id == userID ||
          queryResult.user_email == userEmail ||
          queryResult.restaurant_name == r_name
        ) {
          // console.log("join_check 중복");
          return -1;
        }
      }
    }
  } catch (e) {
    console.log("Error in join_check\n", e);
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
    const query = `INSERT INTO USER_WEB (user_id, user_password, user_name, user_email, restaurant_name)VALUES ('${userID}', '${userPassword}', '${userName}', '${userEmail}', '${r_name}')`;
    console.log(query);

    const result = await pool.query(query);
    console.log("성공");

    return true;
  } catch (e) {
    console.log("Error in join\n", e);
    return false;
  }
};

//아이디 -> restaurant_id 검색
const select_restaurant_id = async function (userID, userPassword) {
  try {
    const query = `SELECT * FROM user_web WHERE user_id = '${userID}'`;
    //console.log(query);

    const result = await pool.query(query);
    
    const queryResult = result[0][0];

    // console.log("q:",queryResult);

    if(queryResult == undefined){
      var restaurant_id = 0;
    } else{
      var restaurant_id = queryResult.restaurant_id;
    }
    // console.log("restaurant_id: ", restaurant_id)
    return restaurant_id
  } catch (e) {
    console.log("Error in login\n", e);
    return false;
  }
};

/*2. 메인페이지*/

//메인페이지 - 테이블 위치값 받아오기
const table_select = async function (userID) {
  table_list = [];
  try {
    var restaurant_id = await select_restaurant_id(userID);
    const query = `SELECT x,y FROM table_location WHERE restaurant_id = '${restaurant_id}'`;
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
    var restaurant_id = await select_restaurant_id(userID);
    const query = `SELECT x,y FROM window_location WHERE restaurant_id = '${restaurant_id}'`;
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

//메인페이지 - 테이블 별 주문 메뉴 나타내기
const table_menu_select_main = async function (userID) {
  order_list = [];
  try {
    var restaurant_id = await select_restaurant_id(userID);
    const query = `SELECT * FROM table_menu WHERE restaurant_id = '${restaurant_id}'`;
    const result = await pool.query(query);

    for (var i = 0; i < result[0].length; i++) {
      var table_num = result[0][i].table_id;
      var menu_name = result[0][i].menu_name;
      var menu_len = result[0][i].menu_count;
      var menu_id = result[0][i].menu_id;

      var order = { table_num, menu_name, menu_len, menu_id };

      order_list.push(order);
    }

    return order_list;
  } catch (e) {
    console.log("Error in table_menu_select_main\n", e);
    return false;
  }
};

// 메인페이지 - 사용중인 테이블 확인하기
const using_table = async function (userID) {
  using_table_list = []
  try {
    var restaurant_id = await select_restaurant_id(userID);
    const query = `select distinct table_id from table_menu WHERE restaurant_id = '${restaurant_id}';`;
    const result = await pool.query(query);

    for (var i = 0; i < result[0].length; i++) {
      var table_num = result[0][i].table_id;
      using_table_num = table_num.split('_')[1];
      using_table_list.push(using_table_num)
    }
    console.log("using_table: ", using_table_list)

    using_table_insert(restaurant_id, using_table_list)

    return 1;
  } catch (e) {
    console.log("Error in using_table\n", e);
    return false;
  }
};

const using_table_insert = async function (restaurant_id, using_table_list) {
  try {
    
    for (var i = 0; i < using_table_list.length; i++) {

      const query = `update table_location set table_count = '1' WHERE restaurant_id = '${restaurant_id}' and table_id = '${using_table_list[i]}';`
      const result = await pool.query(query);
      // console.log("using_table_insert query: ", query)
    }
    
    return 1;
  } catch (e) {
    console.log("Error in using_table_insert\n", e);
    return false;
  }
};

//메인페이지 - 테이블 별 주문 메뉴 조회하기
const table_menu_select = async function (userID, table_num) {
  order_list = [];
  try {
    var restaurant_id = await select_restaurant_id(userID);
    const query = `SELECT * FROM table_menu WHERE restaurant_id = '${restaurant_id}' and table_id = '${table_num}'`;
    const result = await pool.query(query);

    for (var i = 0; i < result[0].length; i++) {
      var menu_name = result[0][i].menu_name;
      var menu_len = result[0][i].menu_count;
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

//메인페이지 - 테이블 별 주문 메뉴 삭제하기 - order_list 접수됐는지 조회/ 접수됐으면(order_status == 1 이면) 주문목록에 보이지 않게
const accept_select = async function (userID, table_num) {
  try {
    var restaurant_id = await select_restaurant_id(userID);
    var number = table_num.split('_')
    var seat_number = number[1];
    const query = `select order_status from order_list where restaurant_id = '${restaurant_id}' and seat_number = '${seat_number}'`;
    // console.log(query)
    const result = await pool.query(query);

    if(result[0][0].order_status == 1){
      accept_delete(restaurant_id, seat_number)
    }

    return true;
  } catch (e) {
    console.log("Error in accept_select\n", e);
    return false;
  }
};

//메인페이지 - 테이블 별 주문 메뉴 삭제하기 - order_list 접수된 항목 삭제
const accept_delete = async function (restaurant_id, seat_number) {
  try {
    const query = `update order_list set order_status = '5' where restaurant_id = '${restaurant_id}' and seat_number = '${seat_number}'`;
    // console.log(query)
    const result = await pool.query(query);
    return true;
  } catch (e) {
    console.log("Error in accept_delete\n", e);
    return false;
  }
};

//메인페이지 - 테이블 별 주문 메뉴 삭제하기
const table_menu_delete = async function (userID, table_num) {
  try {
    var restaurant_id = await select_restaurant_id(userID);
    const query = `DELETE FROM table_menu WHERE restaurant_id = '${restaurant_id}' and table_id = '${table_num}'`;
    // console.log(query)
    const result = await pool.query(query);

    return true;
  } catch (e) {
    console.log("Error in table_menu_delete\n", e);
    return false;
  }
};

//not_using_table 메인페이지 - table_location에 결제된 테이블을 빈 테이블로 바꾸주기
const not_using_table = async function (userID, table_num) {
  try {

    var restaurant_id = await select_restaurant_id(userID);
    not_using_table_num = table_num.split('_')[1];
    const query = `update table_location set table_count = '0' WHERE restaurant_id = '${restaurant_id}' and table_id = '${not_using_table_num}';`
    const result = await pool.query(query);
    console.log("not_using_table query: ", query)
    
    return 1;
  } catch (e) {
    console.log("Error in not_using_table\n", e);
    return false;
  }
};

//메인페이지 - 테이블 별 주문 메뉴 저장하기
const table_menu_save = async function (userID, table_num, order_list) {
  try {
    var restaurant_id = await select_restaurant_id(userID);
    for(i=0; i < order_list.length; i++){
      var menu_name = order_list[i][0];
      var menu_count = order_list[i][1];
      var menu_id = order_list[i][2];
      const query = `insert into table_menu(restaurant_id, table_id, menu_name, menu_count, menu_id) values('${restaurant_id}', '${table_num}', '${menu_name}', '${menu_count}', '${menu_id}');`;
      const result = await pool.query(query);
      // console.log(query);
    }
    // console.log("window_list: ", window_list);
    return true;
  } catch (e) {
    console.log("Error in table_menu_save\n", e);
    return false;
  }
};

//메인페이지 - 예약석 조회
const orders_reser = async function (userID) {
  var order_list = [];
  try {
    var restaurant_id = await select_restaurant_id(userID);
    // console.log("###", last);
    const query = `select * FROM order_list WHERE restaurant_id = '${restaurant_id}';`;
    // console.log(query);
    const result = await pool.query(query);
    // console.log("orders: ", result[0][0]);

    for (var i = 0; i < result[0].length; i++) {
      var menu = result[0][i].menu_name; //메뉴
      var menu_len = result[0][i].menu_count; //메뉴 개수
      var personNum = result[0][i].person_number;
      var seatNum = result[0][i].seat_number;
      var number = result[0][i].order_num; //접수번호
      var acceCan = result[0][i].order_status; //접수or취소

      if (acceCan == null) {
        acceCan == 2;
      }

      var order = [number, menu, menu_len, personNum, seatNum, acceCan];

      order_list.push(order);
      order = [];
    }
    // console.log(order_list);
    return order_list;
  } catch (e) {
    console.log("Error in orders_reser\n", e);
    return false;
  }
};

/* 3. 주문 접수*/

//주문 접수 - 주문 목록 조회
const orders = async function (userID, last) {
  var order_list = [];
  try {
    var restaurant_id = await select_restaurant_id(userID);
    // console.log("###", last);
    const query = `select * FROM order_list WHERE restaurant_id = '${restaurant_id}' and order_num > '${last}' and (order_status is null or order_status = 1)`;
    // console.log(query);
    const result = await pool.query(query);
    // console.log("orders: ", result[0][0]);

    for (var i = 0; i < result[0].length; i++) {
      var menu = result[0][i].menu_name; //메뉴
      var menu_len = result[0][i].menu_count; //메뉴 개수
      var personNum = result[0][i].person_number;
      var seatNum = result[0][i].seat_number;
      var number = result[0][i].order_num; //접수번호
      var acceCan = result[0][i].order_status; //접수or취소

      if (acceCan == null) {
        acceCan == 2;
      }

      var order = [number, menu, menu_len, personNum, seatNum, acceCan];

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
    var restaurant_id = await select_restaurant_id(userID);
    const query = `update order_list set order_status = 1 where restaurant_id ='${restaurant_id}' and order_num = ${submit_num};`;
    // console.log(query);
    const result = await pool.query(query);
    orders_to_table_menu(restaurant_id, submit_num);
    // console.log("orders_submit: ", result[0][0]);
    return true;
  } catch (e) {
    console.log("Error in orders_submit\n", e);
    return false;
  }
};

//주문 접수 - 접수 수락 후 테이블별 메뉴로 전송
const orders_to_table_menu = async function (restaurant_id, submit_num) {
  try {
    menu_name_list = []
    menu_count_list = []
    var menu = await order_num_to_menu(restaurant_id, submit_num);
    // console.log("orders_to_table_menu: ", menu[1]);
    var table_id = "table_" + menu[1];  //완료
    
    for(var i=0; i<menu[0].length; i++){
      // console.log("i: ",i)
      var menu_name = menu[0][i][0];
      var menu_count = menu[0][i][1];
      
      menu_name_list.push(menu_name)
      menu_count_list.push(menu_count)
    }
    
    var menu_select = await menu_id_search(restaurant_id, menu_name_list); // 결과값: [메뉴이름, 아이디, 가격] 리스트 형태
    // console.log("menu_select: ", menu_select)

    for(var j=0; j<menu_select.length; j++){
      var menu_name = menu_select[j][0]
      var menu_id = table_id + "_menu_" + menu_select[j][1] + "@"+ menu_select[j][2];

      const query = `insert into table_menu(restaurant_id, table_id, menu_name, menu_count, menu_id) values 
                    (${restaurant_id},'${table_id}','${menu_name}',${menu_count_list[j]},'${menu_id}');`;
      // console.log(query);
      const result = await pool.query(query);
      // console.log("orders_submit: ", result);
    }
    
    return true;
  } catch (e) {
    console.log("Error in orders_to_table_menu\n", e);
    return false;
  }
};

//주문 번호 -> 메뉴 이름, 개수, 테이블 번호 찾기
const order_num_to_menu = async function (restaurant_id, submit_num) {
  try {
    list = []
    menu_name_count_list = []
    const query = `select * from order_list where restaurant_id = ${restaurant_id} and order_num = ${submit_num};`;
    // console.log(query);
    const result = await pool.query(query);
    // console.log("orders_submit: ", result[0][0].menu_name);
    var menu_name_sum = result[0][0].menu_name.split(',')
    var menu_count_sum = result[0][0].menu_count.split(',')
    // console.log("menu_name_sum:", menu_name_sum)

    for(var i=0; i<menu_name_sum.length; i++){
      var menu = menu_name_sum[i]; //메뉴 이름
      var menu_len = menu_count_sum[i]; //메뉴 개수
      menu_name_count_list.push([menu,menu_len])
    }
    
    var seatNum = result[0][0].seat_number; //테이블 번호

    // list.push(menu_name_count_list, seatNum);
    // console.log("order_num_to_menu: ",list)

    return [menu_name_count_list, seatNum];
  } catch (e) {
    console.log("Error in order_num_to_menu\n", e);
    return false;
  }
};

//메뉴 이름 -> 메뉴 아이디 찾기
const menu_id_search = async function (restaurant_id, menu_name_list) {
  try {
    // menu_name_list = []
    list = []
    // console.log("menu_name_list: ", menu_name_list);
    
    for(var i=0; i < menu_name_list.length; i++){
      const query = `select menu_name, menu_id, menu_price from menu where restaurant_id = ${restaurant_id} and menu_name = '${menu_name_list[i]}';`;
      // console.log("query: ", query)
      const result = await pool.query(query);
      var menu_id = result[0][0];
      list.push([menu_id.menu_name, menu_id.menu_id, menu_id.menu_price]);
    }
    
    // console.log("list: ", list[0]);
    return list;
  } catch (e) {
    console.log("Error in menu_id_search\n", e);
    return false;
  }
};


//주문 접수 - 접수 취소 업데이트
const order_cancel = async function (userID, acc_num, reason_num) {
  try {
    var restaurant_id = await select_restaurant_id(userID);
    const query = `update order_list set order_status = 0, cancel_reason = ${reason_num} where restaurant_id ='${restaurant_id}' and order_num = ${acc_num};`;
    // console.log(query);
    const result = await pool.query(query);
    // console.log("order_cancel: ", result[0][0]);
    return true;
  } catch (e) {
    console.log("Error in order_cancel\n", e);
    return false;
  }
};


/*4. 매장관리 - 영업 임시 중지*/

//매장관리 - 영업 임시 중지 (해당 가게의 데이터가 있는지 확인)
const business_stop_select = async function (userID, tem_stop_time) {
  try {
    var restaurant_id = await select_restaurant_id(userID);
    const query = `SELECT * FROM business_stop WHERE restaurant_id = '${restaurant_id}'`;
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
    var restaurant_id = await select_restaurant_id(userID);
    const query = `SELECT * FROM business_stop WHERE restaurant_id = '${restaurant_id}'`;
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
    var restaurant_id = await select_restaurant_id(userID);

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
    const query = `INSERT INTO business_stop (restaurant_id, finish_date) VALUES('${restaurant_id}','${finishDate}')`;
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
    var restaurant_id = await select_restaurant_id(userID);
    
    const query = `DELETE FROM business_stop WHERE restaurant_id = '${restaurant_id}'`;
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
    var restaurant_id = await select_restaurant_id(userID);
    const query = `SELECT * FROM business_hours WHERE restaurant_id = '${restaurant_id}'`;
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
    var restaurant_id = await select_restaurant_id(userID);

    const query = `SELECT * FROM business_hours WHERE restaurant_id = '${restaurant_id}'`;
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
    var restaurant_id = await select_restaurant_id(userID);
    const query = `INSERT INTO business_hours (restaurant_id, m_s_h, m_s_m, m_f_h, m_f_m, sa_s_h, sa_s_m, sa_f_h,sa_f_m,su_s_h,su_s_m,su_f_h,su_f_m) VALUES('${restaurant_id}','${m_s_h}', '${m_s_m}', '${m_f_h}', '${m_f_m}', '${sa_s_h}', '${sa_s_m}', '${sa_f_h}','${sa_f_m}','${su_s_h}','${su_s_m}','${su_f_h}','${su_f_m}')`;
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
    var restaurant_id = await select_restaurant_id(userID);
    const query = `update business_hours set m_s_h = '${m_s_h}', m_s_m = '${m_s_m}', m_f_h = '${m_f_h}', m_f_m = '${m_f_m}', sa_s_h = '${sa_s_h}', sa_s_m = '${sa_s_m}', sa_f_h = '${sa_f_h}', sa_f_m = '${sa_f_m}', su_s_h = '${su_s_h}', su_s_m = '${su_s_m}', su_f_h = '${su_f_h}', su_f_m = '${su_f_m}' where restaurant_id = '${restaurant_id}'`;
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
    var restaurant_id = await select_restaurant_id(userID);
    const query = `SELECT * FROM holiday WHERE restaurant_id = '${restaurant_id}'`;
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
    var restaurant_id = await select_restaurant_id(userID);
    const query = `insert into holiday (restaurant_id, regulary, temporary) VALUES ('${restaurant_id}','${reg_item}', '${tem_item}')`;
    const result = await pool.query(query);
    const queryResult = result[0][0];
  }catch(e){
    console.log("Error in business_holiday_insert\n", e);
  }
};

//매장 관리 - 휴무일 업데이트
const business_holiday_update = async function (userID, reg_item, tem_item){
  try{
    var restaurant_id = await select_restaurant_id(userID);
    const query = `update holiday set regulary = '${reg_item}', temporary = '${tem_item}' where restaurant_id = '${restaurant_id}'`;
    const result = await pool.query(query);
    const queryResult = result[0][0];
  }catch(e){
    console.log("Error in business_holiday_update\n", e);
  }
};

//매장 관리 - 휴무일 설정 (조회)
const business_holiday_select = async function (userID) {
  try {
    var restaurant_id = await select_restaurant_id(userID);
    // console.log("####reg_item", reg_item)
    const query = `SELECT * FROM holiday WHERE restaurant_id = '${restaurant_id}'`;
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
const table_location = async function (userID) {
// const table_location = async function (userID, table_save) {
  try {
    var restaurant_id = await select_restaurant_id(userID);
    const query = `SELECT * FROM table_location WHERE restaurant_id = '${restaurant_id}'`;
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
    var restaurant_id = await select_restaurant_id(userID);
    // console.log("table_insert에서 table_save값:", table_save);
    for (var i = 0; i < table_save.length; i++) {
      var x = table_save[i][0];
      var y = table_save[i][1];
      const query = `insert into table_location(restaurant_id, x, y, table_count) values('${restaurant_id}','${x}','${y}', 0)`;
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
const window_location = async function (userID) {
// const window_location = async function (userID, window_save) {
  try {
    var restaurant_id = await select_restaurant_id(userID);
    const query = `SELECT * FROM window_location WHERE restaurant_id = '${restaurant_id}'`;
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
    var restaurant_id = await select_restaurant_id(userID);
    // console.log("window_insert에서 window_save값:", window_save);
    for (var i = 0; i < window_save.length; i++) {
      var x = window_save[i][0];
      var y = window_save[i][1];
      const query = `insert into window_location(restaurant_id, x, y) values('${restaurant_id}','${x}','${y}')`;
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
    var restaurant_id = await select_restaurant_id(userID);
    const query = `delete from table_location where restaurant_id = '${restaurant_id}'`;
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
    var restaurant_id = await select_restaurant_id(userID);
    const query = `delete from window_location where restaurant_id = '${restaurant_id}'`;
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
    var restaurant_id = await select_restaurant_id(userID);
    var restaurant_name = await restaurant_idTorestaurant_name(restaurant_id);
    const query = `insert into menu(restaurant_id, menu_img, menu_name, menu_price, menu_explain, restaurant_name) values ('${restaurant_id}','${img}','${menu_title}',${menu_price},'${menu_ex}','${restaurant_name}')`;
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
    var restaurant_id = await select_restaurant_id(userID);
    const query = `SELECT menu_img, menu_name,menu_price,menu_explain,menu_id FROM menu WHERE restaurant_id = '${restaurant_id}'`;
    // console.log(query);
    const result = await pool.query(query);

    for (var i = 0; i < result[0].length; i++) {
      const buffer = Buffer.from(result[0][i].menu_img, "base64");
      var img = buffer.toString();
      var title = result[0][i].menu_name;
      var price = result[0][i].menu_price;
      var ex = result[0][i].menu_explain;
      var id = result[0][i].menu_id;

      var menu_select = { img, title, price, ex, id };
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
    var restaurant_id = await select_restaurant_id(userID);
    const query = `delete from menu where restaurant_id = '${restaurant_id}' and menu_name = '${title}'`;
    // console.log(query);
    const result = await pool.query(query);

    return true;
  } catch (e) {
    console.log("Error in menu_delete\n", e);
    return false;
  }
};

/* 9.매장 관리 - 매장 설정*/

//매장 관리 - 매장 설정 - 수정/등록
const restaurant_sumbit = async function (userID, img, phone, address, category) {
  try {
    var restaurant_id = await select_restaurant_id(userID);
    var restaurant_name = await restaurant_idTorestaurant_name(restaurant_id);
    // console.log("길동?: ",restaurant_name)
    var restaurant_sel = await restaurant_select(userID);
    // console.log("img: ", img)

    if(restaurant_sel == 1){ //해당 가게 정보가 없으면
      // console.log("restaurant_sel == else")
      const query = `insert into restaurant(restaurant_id, restaurant_name, restaurant_address, restaurant_phone, restaurant_theme, restaurant_img) 
      values ('${restaurant_id}','${restaurant_name}','${address}','${phone}','${category}','${img}' )`;
      const result = await pool.query(query);
      
    }else{  //가게 정보가 있으면 삽입
     // console.log("restaurant_sel == 1")
     restaurant_update(restaurant_id,address,phone,category,img); //업데이트
    }
    // console.log("###", query);
    // const queryResult = result[0][0];
    // console.log("img insert", queryResult);
    return true;
  } catch (e) {
    console.log("Error in restaurant_sumbit\n", e);
    return false;
  }
};

//매장 관리 - 매장 설정 - 조회
const restaurant_select = async function (userID) {
  restaurant_list = [];
  try {
    var restaurant_id = await select_restaurant_id(userID);
    var restaurant_name = await restaurant_idTorestaurant_name(restaurant_id);
    const query = `select restaurant_img, restaurant_name, restaurant_address, restaurant_phone, restaurant_theme from restaurant where restaurant_id = '${restaurant_id}'`;
    // console.log("###", query);
    const result = await pool.query(query);
    // console.log("result: ", result[0][0]);

    if(result[0][0] == undefined){ //가게 정보가 없으면
      return 1;
    }else{
      for (var i = 0; i < result[0].length; i++) {
        const buffer = Buffer.from(result[0][i].restaurant_img, "base64");
        var img = buffer.toString();
        var restaurant_name = result[0][i].restaurant_name;
        var restaurant_address = result[0][i].restaurant_address;
        var restaurant_phone = result[0][i].restaurant_phone;
        var restaurant_theme = result[0][i].restaurant_theme;

        var restaurant_sel = { img, restaurant_name, restaurant_address, restaurant_phone, restaurant_theme };
        // console.log("restaurant_select: ", restaurant_sel)
        restaurant_list.push(restaurant_sel);
      }
      return restaurant_list;
  }
  } catch (e) {
    console.log("Error in restaurant_select\n", e);
    return false;
  }
};

//매장 관리 - 매장 설정 - 업데이트
const restaurant_update = async function (restaurant_id,address,phone,category,img) {
  try {
    
    const query = `update restaurant set restaurant_address = '${address}', restaurant_phone = '${phone}', restaurant_theme = '${category}', restaurant_img = '${img}' where restaurant_id = '${restaurant_id}'`;
    // console.log("###", query);
    const result = await pool.query(query);
    // const queryResult = result[0][0];
    // console.log("img insert", queryResult);
    return true;
  } catch (e) {
    console.log("Error in restaurant_update\n", e);
    return false;
  }
};

const token_select = async function (order_num) {
  try {
    var user_id = await user_select(order_num)
    const query = `select token from token where user_id = '${user_id}'`;
    // console.log("###", query);
    const result = await pool.query(query);
    const token = result[0][0].token;
    // console.log("token: ", token);
    return token;
  } catch (e) {
    console.log("Error in token_select\n", e);
    return false;
  }
};

const user_select = async function (order_num) {
  try {
    
    const query = `select user_id from order_list where order_num = '${order_num}'`;
    // console.log("###", query);
    const result = await pool.query(query);
    const queryResult = result[0][0].user_id;
    // console.log("user_select: ", queryResult);
    return queryResult;
  } catch (e) {
    console.log("Error in user_select\n", e);
    return false;
  }
};

module.exports = {
  // (세션, 로그인, 회원가입)
  session_select, //세션 조희
  session_insert, //세션 삽입
  session_update, //세션 업데이트
  cookieToID, //쿠키 -> 사용자 아이디
  restaurant_idTorestaurant_name, //restaurant_id -> restaurant_name 검색
  login, //로그인
  join, //회원가입
  join_check, //회원가입 (중복 체크)
  select_restaurant_id, //사용자 아이디 -> restaurant_id
  // (메인페이지)
  table_select, //테이블 위치값 받아오기
  window_select, //창문 위치값 받아오기
  table_menu_select_main, //테이블 별 주문 메뉴 나타내기
  using_table,  // 메인페이지 - 사용중인 테이블 확인하기
  table_menu_select,  //테이블 별 주문 메뉴 조회
  accept_select,  //메인페이지 - 테이블 별 주문 메뉴 삭제하기 - order_list 접수됐는지 조회
  table_menu_delete, //테이블 별 주문 메뉴 삭제
  not_using_table,  // 메인페이지 - table_location에 결제된 테이블을 빈 테이블로 바꾸주기
  table_menu_save, //테이블 별 주문 메뉴 저장
  orders_reser, //예약석 조회

  // 주문접수
  orders, //주문 목록 조회
  orders_submit, //주문 수락 업데이트
  order_num_to_menu,  // 메뉴 이름, 메뉴 개수, 테이블 번호 조회
  orders_to_table_menu,  //주문 수락후 테이블에 메뉴로 전송
  order_cancel, //주문 취소 업데이트

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

  // 매장관리 - 매장설정
  restaurant_sumbit,  //매장 관리 - 메장 설정 - 수정/등록
  restaurant_select,  //매장 관리 - 메장 설정 - 조회
  restaurant_update,  //매장 관리 - 메장 설정 - 업데이트
  token_select, //user_id를 통해 토큰값 찾기
};