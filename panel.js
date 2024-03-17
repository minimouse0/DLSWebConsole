const host=parseCookie("host")
const token=parseCookie("token")
//const host=document.cookie.split(";")[0].match(/host=(.+)/)[1];
//const token=document.cookie.split(";")[1].match(/token=(.+)/)[1];


/**
 * 向控制台发送指令
 * @param {string} cmd 指令
 * @param callback 收到发送结果后执行的回调函数
 */
function execute(cmd,callback){
	var settings = {
		"url": host+"/execute",
		"method": "POST",
		"timeout": 0,
		"headers": {
			"Content-Type": "application/json"
		},
		"data": JSON.stringify({
			"token": token,
			"cmd": [
				cmd
			]
		}),
	};

	$.ajax(settings).done(function (response) {
		//这里做成如果发送成功就调用css让执行键闪一下绿灯
		//console.log(response);

        /*
		if(response.msg=="提交命令成功!"){
			let execute_button=document.getElementById('execute');
			execute_button.style["background-color"]="#77fc5ccf"
			setTimeout(()=>execute_button.style["background-color"]="#bbb",150);
		}
        */
	});
}

//由用户输入指令并点击执行按钮
function executeCustomCmd(form,event){
	execute(form.value,()=>{});
}
function get_server_status(callback){
	var settings = {
		"url": host+"/process_status",
		"method": "GET",
		"timeout": 0,
	};
	$.ajax(settings).done((response)=>{
		callback(response.online);
	});
}

function _switch(){
	//首先获取服务器是否开启，然后执行开机或关机
		switch_button=document.getElementById('power');
		get_server_status((status)=>{
			if(status){//服务器开启则执行关机
				switch_button_color(switch_button,1);
				execute("stop");
			}
			else{//服务器关闭则执行开机
				switch_button_color(switch_button,0);
				execute("start");
			}
			switch_button_wait_status_change(switch_button,status);//执行开关命令后等待改变开关按钮颜色
		})


}
function switch_button_wait_status_change(switch_button,old_status){
		let switch_button_task_id=setInterval(()=>{//轮询进程状态等待其改变
			get_server_status((current_status)=>{
				if(current_status!=old_status){//一旦有一次请求发现状态改变
					console.log(current_status)
					switch_button_color(switch_button,Number(current_status));
					clearInterval(switch_button_task_id);//既然已经发现状态改变，执行完改变后立刻停止轮询
				}
			})
		},500)		

}
function switch_button_color(switch_button,status){
	switch(status){
		case 0:switch_button.style["background-color"]="#bbb";break;
		case 1:switch_button.style["background-color"]="green";break;
	}
	
}
function executeBak(){
    execute('startBak');
    setTimeout(()=>{get_server_status()},200);
}
function executeRestart(){
    execute("restart");
}

function get_server_load(callback){
    var settings = {
        "url": host+"/server_status",
        "method": "GET",
        "timeout": 0,
    };

    $.ajax(settings).done(function (response) {
        callback(response);
    });
}
let load_request_interval=1000;
get_server_load((response)=>{});