//- 영업 임시 중지
function tem_stop(e) {
  e.preventDefault(); //버튼 클릭후 페이지 이동을 방지해주는 코드

  const s = document.querySelector(".tem_stop_option");

  var tem_stop_time = s.selectedOptions[0].value;

  console.log(tem_stop_time);

  const reqBody = {
    cookie: getCookie("id"),
    tem_stop_time: s.selectedOptions[0].value,
  };

  const xhr = new XMLHttpRequest();

  xhr.onload = () => {
    const result = JSON.parse(xhr.responseText);
    if (result.code == -1) {
      alert("영업 임시 중지가 이미 실행중입니다.");
      movePage("management");
      //- location.href = "management";
    } else if (result.code == 0) {
      alert(
        "설정했던 일시정지 시간이 아직 다 지나지 않았습니다.\n 지난 후 다시 설정해 주세요."
      );
      movePage("management");
      //- location.href = "management";
    } else if (result.code == 1) {
      //- console.log("consloe: ",result.message);
      alert("임시 중지가 시작되었습니다.");
      movePage("management");
      //- location.href = "management";
    } else {
      console.log("임시중지 error");
    }
  };
  xhr.open("POST", "/management");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(reqBody));
}

//임시 중지 시간 타이머
function startTimer(remainTime) {
  //#{remain}
  //- console.log('remain:: ', typeof remainTime)
  let rem = remainTime;
  const r = document.querySelector("#remainTd");

  if (rem == 0) {
    r.innerText = `설정된 시간이 없습니다.`;
  } else {
    var timer = setInterval(() => {
      const xhr = new XMLHttpRequest();

      xhr.open("get", "/management");

      console.log("###", rem);
      r.innerText = `${rem--}분`;
      if (rem < 0) {
        r.innerText = `설정된 시간이 없습니다.`;
        clearInterval(timer);
      }
    }, 1000 * 60);
  }
}

//- 영업 시간 설정
function business_hours_setting(e) {
  e.preventDefault(); //버튼 클릭후 페이지 이동을 방지해주는 코드

  var m_s_h1 = document.querySelector(".mfhs"); //월~금 시작 시
  var m_s_m1 = document.querySelector(".mfms"); //월~금 시작 분
  var m_f_h1 = document.querySelector(".mfhf"); //월~금 끝 시
  var m_f_m1 = document.querySelector(".mfmf"); //월~금 끝 분
  var sa_s_h1 = document.querySelector(".shs"); //토 시작 시
  var sa_s_m1 = document.querySelector(".sms"); //토 시작 분
  var sa_f_h1 = document.querySelector(".shf"); //토 끝 시
  var sa_f_m1 = document.querySelector(".smf"); //토 끝 분
  var su_s_h1 = document.querySelector(".suhs"); // 일 시작 시
  var su_s_m1 = document.querySelector(".sums"); // 일 시작 분
  var su_f_h1 = document.querySelector(".suhf"); // 일 끝 시
  var su_f_m1 = document.querySelector(".sumf"); // 일 끝 분

  var m_s_h = m_s_h1.selectedOptions[0].value;
  var m_s_m = m_s_m1.selectedOptions[0].value;
  var m_f_h = m_f_h1.selectedOptions[0].value;
  var m_f_m = m_f_m1.selectedOptions[0].value;
  var sa_s_h = sa_s_h1.selectedOptions[0].value;
  var sa_s_m = sa_s_m1.selectedOptions[0].value;
  var sa_f_h = sa_f_h1.selectedOptions[0].value;
  var sa_f_m = sa_f_m1.selectedOptions[0].value;
  var su_s_h = su_s_h1.selectedOptions[0].value;
  var su_s_m = su_s_m1.selectedOptions[0].value;
  var su_f_h = su_f_h1.selectedOptions[0].value;
  var su_f_m = su_f_m1.selectedOptions[0].value;

  console.log(m_s_h);

  const reqBody = {
    cookie: getCookie("id"),
    m_s_h: m_s_h1.selectedOptions[0].value,
    m_s_m: m_s_m1.selectedOptions[0].value,
    m_f_h: m_f_h1.selectedOptions[0].value,
    m_f_m: m_f_m1.selectedOptions[0].value,
    sa_s_h: sa_s_h1.selectedOptions[0].value,
    sa_s_m: sa_s_m1.selectedOptions[0].value,
    sa_f_h: sa_f_h1.selectedOptions[0].value,
    sa_f_m: sa_f_m1.selectedOptions[0].value,
    su_s_h: su_s_h1.selectedOptions[0].value,
    su_s_m: su_s_m1.selectedOptions[0].value,
    su_f_h: su_f_h1.selectedOptions[0].value,
    su_f_m: su_f_m1.selectedOptions[0].value,
  };

  const xhr = new XMLHttpRequest();

  xhr.onload = () => {
    const result = JSON.parse(xhr.responseText);
    console.log("result: ", result.code);
    if (result.code == 2) {
      alert("영업 시간이 설정되었습니다.");
      movePage("management");
    } else {
      alert("영업 시간 설정 error.");
    }
  };

  xhr.open("POST", "/business_hours_set");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(reqBody));
}

//- 휴무일 설정
function holiday_setting(e) {
  e.preventDefault(); //버튼 클릭후 페이지 이동을 방지해주는 코드

  const reg = document.querySelector("#reg_p");
  const tem = document.querySelector("#tem_p");

  console.log("reg: ", reg);

  // var tem_stop_time = s.selectedOptions[0].value;

  const reqBody = {
    cookie: getCookie("id"),
    // tem_stop_time: s.selectedOptions[0].value,
  };

  const xhr = new XMLHttpRequest();

  xhr.onload = () => {
    const result = JSON.parse(xhr.responseText);
  };
  xhr.open("POST", "/management");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(reqBody));
}

// 정기 휴무 - 매주 추가 버튼 클릭시
var week_id = 0;
var month_id = 0;
var year_id = 0;
var tem_id = 0;
var week = 0;
var month = 0;
var year = 0;
var tem = 0;
var regular = [];
var temporary = [];

function everyWeek() {
  const reg_in = document.querySelector("#reg_in"); //정기 휴무 div칸 아이디로 가져옴

  const select_option_w = document.querySelector("#s_week"); //선택한 주의 옵션 가져옴
  var s_week = select_option_w.selectedOptions[0].value;

  const select_option_d = document.querySelector("#s_day"); //선택한 요일의 옵션 가져옴
  var s_day = select_option_d.selectedOptions[0].value;

  if (s_week != "선택" && s_day != "선택") {
    var add_holiday = document.createElement("tr"); //add_holiday라는 tr를 만듦
    var week_id = "add_holiday_day" + week; //add_holiday에 넣어줄 동적 아이디 생성

    add_holiday.id = week_id; //add_holiday에 넣어줄 동적 아이디 부여
    add_holiday.innerHTML = `<input type='button' value='X' onclick='remove("${week_id}")' /> <p id="reg_p" style="float:left;" >매주 ${s_week}주 ${s_day}요일</p>`;
    // console.log(reg_in);
    reg_in.appendChild(add_holiday); //정기휴무 div칸에 선택한 옵션들 추가
    week++;
  }
}
// 정기 휴무 - 매월 추가 버튼 클릭시
function everyMonth() {
  const reg_in = document.querySelector("#reg_in"); //정기 휴무 div칸 아이디로 가져옴

  const select_option_d = document.querySelector("#m_day"); //선택한 월의 옵션 가져옴
  var m_day = select_option_d.selectedOptions[0].value;

  if (m_day != "선택") {
    var add_holiday_month = document.createElement("tr"); //add_holiday라는 div를 만듦
    var month_id = "add_holiday_month_" + month; //add_holiday에 넣어줄 동적 아이디 생성

    add_holiday_month.id = month_id; //add_holiday에 넣어줄 동적 아이디 부여
    add_holiday_month.innerHTML = `<input type='button' value='X' onclick='remove("${month_id}")' /><p id="reg_p" style="float:left;">매월 ${m_day}일 </p>`;
    // console.log(month_id);
    reg_in.appendChild(add_holiday_month); //정기휴무 div칸에 선택한 옵션들 추가
    regular.push();
    month++;
  }
}

// 정기 휴무 - 매년 추가 버튼 클릭시
function everyYear() {
  const reg_in = document.querySelector("#reg_in"); //정기 휴무 div칸 아이디로 가져옴

  const select_option_m = document.querySelector("#y_month"); //선택한 주의 옵션 가져옴
  var y_month = select_option_m.selectedOptions[0].value;

  const select_option_d = document.querySelector("#y_day"); //선택한 요일의 옵션 가져옴
  var y_day = select_option_d.selectedOptions[0].value;

  if (y_month != "선택" && y_day != "선택") {
    var add_holiday_year = document.createElement("tr"); //add_holiday라는 div를 만듦
    var year_id = "add_holiday_year" + year; //add_holiday에 넣어줄 동적 아이디 생성

    add_holiday_year.id = year_id; //add_holiday에 넣어줄 동적 아이디 부여
    add_holiday_year.innerHTML = `<input type='button' value='X' onclick='remove("${year_id}")' /> <p id="reg_p" style="float:left;"> 매년 ${y_month}월 ${y_day}일 </p>`;
    // console.log(reg_in);
    reg_in.appendChild(add_holiday_year); //정기휴무 div칸에 선택한 옵션들 추가
    year++;
  }
}

// 임시 휴무 - 추가 버튼 클릭시
function temporary_holiday() {
  const tem_in = document.querySelector("#tem_in"); //정기 휴무 div칸 아이디로 가져옴

  const input_year_start = document.querySelector("#tem_year_start"); //입력한 시작 년도를 가져옴
  var tem_year_start = input_year_start.value;

  const input_month_start = document.querySelector("#tem_month_start"); //입력한 시작 월을 가져옴
  var tem_month_start = input_month_start.value;

  const input_day_start = document.querySelector("#tem_day_start"); //입력한 시작 일을 가져옴
  var tem_day_start = input_day_start.value;

  const input_year_finish = document.querySelector("#tem_year_finish"); //입력한 종료 년도 가져옴
  var tem_year_finish = input_year_finish.value;

  const input_month_finish = document.querySelector("#tem_month_finish"); //입력한 종료 월 가져옴
  var tem_month_finish = input_month_finish.value;

  const input_day_finish = document.querySelector("#tem_day_finish"); //입력한 종료 일 가져옴
  var tem_day_finish = input_day_finish.value;

  // console.log("####", tem_year_start.length);
  if (
    tem_year_start.length != 0 &&
    tem_month_start.length != 0 &&
    tem_day_start.length != 0 &&
    tem_year_finish.length != 0 &&
    tem_month_finish.length != 0 &&
    tem_day_finish.length != 0
  ) {
    var tem_holiday = document.createElement("tr"); //add_holiday라는 div를 만듦
    var tem_holiday_id = "tem_holiday" + tem; //add_holiday에 넣어줄 동적 아이디 생성

    tem_holiday.id = tem_holiday_id; //add_holiday에 넣어줄 동적 아이디 부여
    tem_holiday.innerHTML = `<input type='button' value='X' onclick='remove_tem("${tem_holiday_id}")' /><p id="tem_p" style="float:left;"> ${tem_year_start}년 ${tem_month_start}월 ${tem_day_start}일 ~ ${tem_year_finish}년 ${tem_month_finish}월 ${tem_day_finish}일 </p>`;
    // console.log(reg_in);
    tem_in.appendChild(tem_holiday); //정기휴무 div칸에 선택한 옵션들 추가
    tem++;
  }
}

//선택한 항목 제거-정기휴무
function remove(id) {
  // console.log(id);
  var target = document.querySelector("#" + id); //문자열로 받아온 wid에 해당하는 객체를 받아옴.
  reg_in.removeChild(target); //부모요소(reg_in)에서 자식요소(target)를 제거함(html 요소에서 제거).
}

//선택한 항목 제거-임시휴무
function remove_tem(id) {
  // console.log(id);
  var target = document.querySelector("#" + id); //문자열로 받아온 wid에 해당하는 객체를 받아옴.
  tem_in.removeChild(target); //부모요소(reg_in)에서 자식요소(target)를 제거함(html 요소에서 제거).
}
