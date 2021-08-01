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
            // console.log("menu_name: ", menu_name.srcElement.innerText)
            
            var clicked_menu = menu_name.srcElement.innerText;
            menu_add(clicked_menu);
        };
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

// 메뉴 클릭시
function menu_add(clicked_menu){
    console.log("clicked_menu:", clicked_menu)
}

// 테이블 클릭시
function click(clicked_table){
    console.log("clicked_table: ", clicked_table);

    // 테이블 클릭 후 메뉴 클릭하면 해당 테이블에 메뉴가 추가되어야함.
}