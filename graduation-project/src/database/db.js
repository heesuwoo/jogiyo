const pool = require("./config");

//세션 있는지 조회
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

//세션 삽입
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

//세션 업데이트
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
    console.log("cookie를 userID로 바꾸면: ", userID);
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

    //console.log("queryResult: " + result[0]);
    //console.log("userPassword: " + userPassword);

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

// 회원가입시 중복되는 아이디가 있는지 체크
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
    console.log("Error in joincheck\n", e);
    return false;
  }
};

//회원가입(db에 정보 추가)
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

//##
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
      business_stop_delete(userID);
    }, Number(tem_stop_time) * 1000 * 60);

    return true;
  } catch (e) {
    console.log("Error in business_stop_insert\n", e);
    return false;
  }
};

//일정 시간후 삭제
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

//영업 시간 조회
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

//영업 시간 삽입
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

//영업 시간 업데이트
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

module.exports = {
  session_select,
  cookieToID,
  login,
  join,
  join_check,
  business_stop_select,
  business_select,
  business_hours_select,
};
