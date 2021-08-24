//메뉴 불러오기 메뉴 title 넘겨받음
function menu(menu_list){

    const pos_position = document.querySelector(".content")

    //- console.log("menu_list.length: ", menu_list.length)
    for(var j = 0; j < menu_list.length; j++){

        var menu_item = document.createElement('div');  //item div생성
        var menu_id = 'menu_' + j;  //menu id 동적생성
        menu_item.id = menu_id; //munu id 부여
        menu_item.className = 'item';
        menu_item.style.cursor = "pointer";
        menu_item.innerHTML = `<h4 style = 'text-align: center; margin-top: 50%'> ${menu_list[j]} </h4>`;
        pos_position.appendChild(menu_item);
        menu_name = menu_list[j];

        //메뉴 버튼 클릭 시
        menu_item.onclick = function(menu_name){

            var clicked_menu = menu_name.srcElement.innerText;  //클릭한 메뉴 이름 읽음
            var clicked_menu_id = menu_name.srcElement.id;  //클릭한 메뉴의 id값 읽음
            // console.log("clicked_menu: ", clicked_menu)
            
            // var table_select = document.querySelector(".box_border2")
            var table_name = document.querySelector(".box_border2").id; //좌측 사각형 박스의 id값 가져옴(클릭한 테이블 id 값을 가져옴)(ex. table_1)
            var a = "#list_" + table_name;  //생성해 줄 테이블 리스트의 동적 id 값 만들기(ex. #list_table_1 ; tbody의 id)
            const table_add_menu = document.querySelector(`${a}`)   //클릭한 메뉴를 넣어줄 리스트 객체 가져오기(tbody의 id 가져오기)
            
            if(document.getElementById(`${table_name}_${clicked_menu_id}`)){    //선택한 메뉴의 id(ex. table_1_menu_1)가 목록에 있으면, 메뉴 개수에 +1 해줌

                var count_td = document.getElementById(`${table_name}_${clicked_menu_id}_count`)    //개수가 나타나는 td 객체를 불러온다.
                // console.log("asfd",count_td.innerText);
                var i = count_td.innerText; //개수에 속하는 정수값을 가져온다.
                i++;    //+1을 더해준다.

                count_td.innerText = i; //해당 td 객체에 개수를 수정해서 넣어준다.
                
            }else{  //선택한 메뉴가 목록에 없을 시, 목록에 추가
                if(table_name != null && clicked_menu_id != null){
                    var td_add = document.createElement('tr')
                    // var i = 1;
                    console.log(`table_name: ${table_name}  clicked_menu_id: ${clicked_menu_id}`)
                    td_add.innerHTML = `<td id="${table_name}_${clicked_menu_id}">${clicked_menu}</td> <td id="${table_name}_${clicked_menu_id}_count">1</td><td><button onclick = x_menu('${table_name}_${clicked_menu_id}_count')>-</button></td>`
                    table_add_menu.appendChild(td_add);
                }
            }
        }
    }
}

// '-'버튼 클릭시
function x_menu(menu_td_id){    //메뉴 하나 삭제
    console.log(menu_td_id)
    var count_td = document.getElementById(`${menu_td_id}`)    //개수가 나타나는 td dom을 불러온다.
    console.log("x_menu 함수에서의 개수: ", count_td);
    var i = count_td.innerText;
    i--;
    if(i == 0){
        const menu_tr = count_td.parentNode;    //메뉴 명
        const menu_table = menu_tr.parentNode;  //메뉴 테이블 리스트

        menu_table.removeChild(menu_tr)
    } else{
        count_td.innerText = i;
    }
}


//테이블 불러오기
function table_draw(table_list){
    
    for(var i = 0; i < table_list.length; i++){
        const container = document.querySelector('#box');
        const containerWidth = container.clientWidth //컨테이너 박스의 x좌표를 가져옴
        const containerHeight = container.clientHeight //컨테이너 박스의 y좌표를 가져옴
        
        var table = document.createElement('div');
        var x_pot = table_list[i].x
        var y_pot = table_list[i].y

        var left = x_pot * containerWidth;
        var top = y_pot * containerHeight;
        
        //- console.log(left , top)
        var t_id = 'table_' + i;
        table.id = t_id;
        table.style.cursor = "pointer";
        table.style.position = "absolute";
        table.style.left = `${left}px`;
        table.style.top = `${top}px`;
        table.style.width="10%";
        table.style.height="14%";
        table.style.backgroundColor="#f2cfa5";
        table.style.border="1px solid black";
        table.innerHTML = `<p> ${t_id} </p>`;

        container.appendChild(table);
        
        table.onclick = function(t_id){
            // console.log("table number: ", t_id.srcElement);
            var clicked_table = t_id.srcElement;
            click(clicked_table);
        };
    }
}

//창문 불러오기
function window_draw(window_list){
    const container = document.querySelector('#box');
    const containerWidth = container.clientWidth //컨테이너 박스의 x좌표를 가져옴
    const containerHeight = container.clientHeight //컨테이너 박스의 y좌표를 가져옴

    
    for(var i = 0; i < window_list.length; i++){
        var window = document.createElement('div');
        var x_pot = window_list[i].x
        var y_pot = window_list[i].y

        var left = x_pot * containerWidth;
        var top = y_pot * containerHeight;
        
        //- console.log(left , top)
        var w_id = 'window_' + i;
        window.id = w_id;
        window.style.position = "absolute";
        window.style.left = `${left}px`;
        window.style.top = `${top}px`;
        window.style.width="10%";
        window.style.height="5%";
        window.style.backgroundColor="#fdfa87";
        window.style.border="1px solid black";
        window.innerHTML = `<p> ${w_id} </p>`;

        container.appendChild(window);
    }
}

// 테이블 클릭시
function click(clicked_table){

    var table_num = clicked_table.id;
    console.log("clicked_table: ", table_num);

    const body_container = document.querySelector('.main_body');
    const container = document.querySelector('#box');

    var list_div = document.createElement('div')
    var t_list = `<table class="table table-striped" style="text-align: center; border: 1px; font-size: xx-large; solid #dddddd"><thead><tr><th style="background-color: #eeeeee; text-align: center;" colspan ="3">주문 메뉴</th></tr></thead><tbody id= "list_${clicked_table.id}"></tbody></table>`;
    list_div.innerHTML = `<h1> ${clicked_table.id} </h1>` + t_list;
    list_div.id = clicked_table.id;
    list_div.className = 'box_border2';
    list_div.style.background = '#e3e3ff';
    
    var back = document.createElement('button');
    back.innerHTML = `<p>이전</p>`;
    back.style.position = "absolute";
    back.style.left = '0%';
    back.style.top = '0%';
    back.style.width = '5%';
    back.style.height = '5%';

    list_div.appendChild(back)

    body_container.removeChild(container)
    body_container.appendChild(list_div)

    // const pay_button = document.querySelector('.pay');
    // pay_button.innerText = "결제";

    // 뒤로가기 버튼 클릭 시
    back.onclick = function(table_num){
        save_table_order();
        body_container.removeChild(list_div)
        body_container.appendChild(container)
    }

    const reqBody = {
                cookie : getCookie("id"),
                table_num : table_num,
        }

        const xhr = new XMLHttpRequest()
        xhr.onload = () => {
            const result = JSON.parse(xhr.responseText)

            var order_list = result.order_list;
            // console.log("!!!", order_list)
            order_list_draw(table_num, order_list);
        }

    xhr.open('POST', '/pos_order_sele')
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(reqBody))
}

//뒤로가기 버튼 클릭시 - 메뉴 저장
function save_table_order(){

    var table_num = document.querySelector(".box_border2").id   //table_6
    var tbody_table = "#list_" + table_num;

    var tbody_col = document.querySelector(tbody_table).rows.length;    //테이블 행 개수
    
    var order_list =[]

    for(i=0; i < tbody_col; i++){
        var list_menu_name = "#" + table_num + "_menu_" + i;
        var list_menu_len = list_menu_name + "_count"
        var save_menu_name = document.querySelector(list_menu_name).innerText //한 행의 메뉴 이름 불러옴
        var save_menu_len = document.querySelector(list_menu_len).innerText   //한 행의 메뉴 개수 불러옴

        var save_menu_id = table_num + "_menu_" + i;

        order_list.push([save_menu_name, save_menu_len, save_menu_id]);
        // console.log("save_menu_name: ", save_menu_name)
    }
    console.log("save_table_orders: ")
    //router로 전송
    const reqBody = {
        cookie : getCookie("id"),
        table_num : table_num,
        order_list : order_list,
    }
        
    const xhr = new XMLHttpRequest()
    xhr.onload = () => {
        const result = JSON.parse(xhr.responseText)
        if(result.code != 1){
            alert("메뉴 저장 error");
        }
    }
    xhr.open('POST', '/pos_order')
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(reqBody))
}

//테이블 클릭시 리스트 출력
function order_list_draw(table_num, order_list){

    var table_list_name = "#list_" + table_num
    const table_add_menu = document.querySelector(table_list_name)
    
    // console.log("afdf", order_list.length)
    for(var j=0; j < order_list.length; j++){
        var menu_name = order_list[j].menu_name
        var menu_len = order_list[j].menu_len
        var menu_id = order_list[j].menu_id

        console.log(menu_name, menu_len, menu_id)

        var td_add = document.createElement('tr')
        td_add.innerHTML = `<td id="${menu_id}">${menu_name}</td> <td id="${menu_id}_count">${menu_len}</td><td><button onclick = x_menu('${menu_id}_count')>-</button></td>`
        table_add_menu.appendChild(td_add);
    }
    // td_add.innerHTML = `<td id="${table_num}_${clicked_menu_id}">${clicked_menu}</td> <td id="${table_name}_${clicked_menu_id}_count">1</td><td><button onclick = x_menu('${table_name}_${clicked_menu_id}_count')>-</button></td>`
    // table_add_menu.appendChild(td_add);
}

function pay(){

    const pay_button = document.querySelector('.box_border2').id;
    
    if(pay_button !='box'){

        var table_num = document.querySelector(".box_border2").id   //table_6
        var tbody_table = "#list_" + table_num;

        var tbody_col = document.querySelector(tbody_table).rows.length;    //테이블 행 개수
        
        var order_list =[]

        for(i=0; i < tbody_col; i++){
            var list_menu_name = "#" + table_num + "_menu_" + i;
            var list_menu_len = list_menu_name + "_count"
            var save_menu_name = document.querySelector(list_menu_name).innerText //한 행의 메뉴 이름 불러옴
            var save_menu_len = document.querySelector(list_menu_len).innerText   //한 행의 메뉴 개수 불러옴

            var save_menu_id = table_num + "_menu_" + i;

            order_list.push([save_menu_name, save_menu_len, save_menu_id]);
            // console.log("save_menu_name: ", save_menu_name)
        }

        const reqBody = {
            cookie : getCookie("id"),
            table_num : pay_button,
            order_list : order_list,
        }
            
        const xhr = new XMLHttpRequest()
        xhr.onload = () => {
            const result = JSON.parse(xhr.responseText)
            if(result.code == 1){
                alert("결제 되었습니다.");
                movePage('main')
            }else{
                alert("결제 error");
            }
        }
        xhr.open('POST', '/pay')
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(reqBody))
    }
    
}





/*function pay(){

    const pay_button = document.querySelector('.box_border2').id;
    
    if(pay_button !='box'){

        save_table_order();


        
        const reqBody = {
            cookie : getCookie("id"),
            table_num : pay_button,
        }
            
        const xhr = new XMLHttpRequest()
        xhr.onload = () => {
            const result = JSON.parse(xhr.responseText)
            if(result.code == 1){
                alert("결제 되었습니다.");
                movePage('main')
            }else{
                alert("결제 error");
            }
        }
        xhr.open('POST', '/pay')
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(reqBody))
    }
    
}*/