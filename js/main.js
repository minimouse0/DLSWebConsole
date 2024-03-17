cookie_data = parseCookie();
const host = cookie_data["host"];
const token = cookie_data["token"];

//网页加载完毕才加载的部分
$(function () {
    //清空网页加载时莫名其妙出现的一堆tab
    console.log("114514");
    document.getElementById('command').value = "";
    //检测return/enter键
    $(document).on('keypress', function (e) {
        //后面要检测ctrl+enter换行
        if (e.which == 13) {
            executeCustomCmd(document.getElementById('command'))
            //清空所有指令输入框中的内容
            setTimeout(() => {
                document.getElementById('command').value = "";
            }, 100)

        }
    });
})

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
