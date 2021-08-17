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

        menu_item.onclick = function(menu_name){

            var clicked_menu = menu_name.srcElement.innerText;
            var clicked_menu_id = menu_name.srcElement.id;
            console.log("clicked_menu: ", clicked_menu)
            
            var table_name = document.querySelector(".box_border2").id;
            var a = "#list_" + table_name;
            const table_add_menu = document.querySelector(`${a}`)
            
            if(document.getElementById(`${table_name}_${clicked_menu_id}`)){    //중복된 메뉴가 리스트에 있으면

                var count_td = document.getElementById(`${table_name}_${clicked_menu_id}_count`)    //개수가 나타나는 td dom을 불러온다.
                // console.log("asfd",count_td.innerText);
                var i = count_td.innerText;

                i++;
                count_td.innerText = i;
                
            }else{
                var td_add = document.createElement('tr')
                var i = 1;
                td_add.innerHTML = `<td id="${table_name}_${clicked_menu_id}">${clicked_menu}</td> <td id="${table_name}_${clicked_menu_id}_count">1</td><td><button onclick = x_menu('${table_name}_${clicked_menu_id}_count')>-</button></td>`
                table_add_menu.appendChild(td_add);
            }
        }
    }
}

function x_menu(menu_td_id){    //메뉴 하나 삭제
    console.log(menu_td_id)
    var count_td = document.getElementById(`${menu_td_id}`)    //개수가 나타나는 td dom을 불러온다.
    console.log("13", count_td);
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

    // 뒤로가기 버튼 클릭 시
    back.onclick = function(table_num){
        db_transter_menu(table_num);
        body_container.removeChild(list_div)
        body_container.appendChild(container)
    }
}

function db_transter_menu(table_num){
    const reqBody = {
        cookie : getCookie("id")
    }

    const xhr = new XMLHttpRequest()
        xhr.onload = () => {
            const result = JSON.parse(xhr.responseText)

             for(var i=0; i<result.menu.length; i++ ){
                var menu_title = result.menu[i].title
                menu_list.push(menu_title)
            }
            m_id = menu(menu_list) //메뉴 불러오기 메뉴 title 넘겨받음
            console.log("menu_list: ", menu_list)
        }

        xhr.open('POST', '/main')
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send(JSON.stringify(reqBody))


}

