function parseCookie() {
	cookie_data = {}
	let ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let item = ca[i].trim().split("=");
		if (item.length > 1) {
			cookie_data[item[0]] = item[1];
		}
	}
	return cookie_data;
}
cookie_data = parseCookie();
const host = cookie_data["host"];
const token = cookie_data["token"];

/**
 * 向控制台发送指令
 * @param {string} cmd 指令
 * @param callback 收到发送结果后执行的回调函数
 */
function execute(cmd, callback) {
	var settings = {
		"url": host + "/execute",
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
function executeCustomCmd(form, event) {
	execute(form.value, () => { });
}