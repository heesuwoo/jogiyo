// 쿠키 생성
var setCookie = function (name, value, exp) {
  var date = new Date();
  date.setTime(date.getTime() + exp * 24 * 60 * 60 * 1000);
  document.cookie =
    name + "=" + value + ";expires=" + date.toUTCString() + ";path=/";
};

//- 드롭다운 메뉴
function drop_menu() {
  var checkEvent = getCookie("id");
  var menu = document.querySelector(".dropdown-menu");

  // 쿠키 조회
  if (getCookie("id") == null) {
    var drop_login = document.createElement("li");
    var drop_join = document.createElement("li");
    drop_login.innerHTML = `<a href='login'> 로그인 </a>`;
    drop_join.innerHTML = `<a href='join'> 회원가입 </a>`;
    menu.appendChild(drop_login);
    menu.appendChild(drop_join);
  } else {
    var drop = document.createElement("li");
    drop.innerHTML = `<a href="" onclick = deleteCookie("id");> 로그아웃 </a> `;
    menu.appendChild(drop);
  }
}

//- 쿠키 가져오기
var getCookie = function () {
  //   console.log(document.cookie);
  let cookie = document.cookie;
  const sid = cookie.split("=")[1];
  //   var value = document.cookie.match(/(^|;) ?" + name + "=([^;]*)(;|$)/);

  return sid;
};

//- 로그아웃 시 쿠키 삭제 및 페이지 스테이 방지
var deleteCookie = function (name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1999 00:00:10 GMT;";
  history.replaceState(null, "", "/main"); //메인페이지 이동

  // alert("로그아웃 되었습니다.");
  const xhr = new XMLHttpRequest();

  // 세션만 지워달라
  xhr.onload = () => {
    if (xhr.responseText === "success") {
      alert("로그아웃 되었습니다.");
    }
  };

  xhr.open("POST", "/logout");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send();
};

//네비게이션 바에서 페이지 이동
function movePage(pageName) {
  // 쿠키 가져오기
  var cookie = getCookie();
  console.log("#", cookie);
  //undefiend인 경우
  if (cookie == undefined) {
    if (pageName == "main") {
      location.href = "/main";
    } else {
      alert("로그인을 먼저 해주세요.");
      location.href = "/login";
    }
  } else {
    location.href = `/${pageName}?id=${cookie}`;
  }
}
