const host=localStorage.getItem("host")
const token=localStorage.getItem("token")

function activeConsole(){
	//请求顶层窗口转发
	window.parent.postMessage({type:"transfer",destination:"serverConsole",data:{type:"activeConsole",data:{}}})
}
/**
 * 向控制台发送指令
 * @param {string} cmd 指令
 * @param callback 收到发送结果后执行的回调函数
 */
function execute(cmd,callback){
	if(isDLSProtocol()){
		sendData(JSON.stringify({
			type:"execute",
			data:cmd
		}))
		//由于协议暂时没有发送成功的提示，所以立刻闪灯
		execute_button_flash()			
	}
	else{
		let settings = {
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
			if(response.msg=="提交命令成功!"){
				execute_button_flash();

			}
		});		
	}

	//原生协议需要激活控制台
    if(!isDLSProtocol())activeConsole()
}

function execute_button_flash(){
	let execute_button=document.getElementById('send');
	if(execute_button==undefined)return;
	//设置按钮颜色和渐变时长实现快速亮起
	execute_button.style["transition"]="0.2s"
	execute_button.style["background-color"]="#36f"
	//设置按钮颜色和渐变时长实现缓慢熄灭
	setTimeout(()=>{
		execute_button.style["transition"]="0.5s"
		execute_button.style["background-color"]="#b0c9f7";
		//动画播放完了再给设置回去，时长同上面缓慢熄灭的时长
		//setTimeout(()=>execute_button.style["transition"]="0.2s",120)
	},200);
}
const customCmdHistory=[]
function recordCmdHistory(cmd){
	//如果和上条历史命令一致，那么不记录
	if(cmd===customCmdHistory[customCmdHistory.length-1])return;
	//如果为空则不记录
	if(cmd=="")return;
	customCmdHistory.push(cmd);
}
//由用户输入指令并点击执行按钮
function executeCustomCmd(form,event){
	//拦截表单默认提交行为
    event.preventDefault();
	execute(form.value,()=>{});
	//记录为历史命令
	recordCmdHistory(form.value)
}
function get_server_status(callback){
	if(isDLSProtocol()){
        const requestUID=generateToken()
        ServerEvents.expectations.add({
            type:"fetch_process_status_result",
            requestUID,
            callback:msg=>{
                callback(msg.data)
            }
        })
		sendData(JSON.stringify({
			type:"fetch_process_status",
			requestUID:requestUID
		}))
	}
	else{
		var settings = {
			"url": host+"/process_status",
			"method": "GET",
			"timeout": 0,
		};
		$.ajax(settings).done((response)=>{
			callback(response.online);
		});		
	}

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
		//原生协议下执行开关命令后等待改变开关按钮颜色
		if(!isDLSProtocol())switch_button_wait_status_change(switch_button,status);
	})
}
function switch_button_wait_status_change(switch_button,old_status){
	let switch_button_task_id=setInterval(()=>{//轮询进程状态等待其改变
		get_server_status((current_status)=>{
			if(current_status!=old_status){//一旦有一次请求发现状态改变
				switch_button_color(switch_button,Number(current_status));
				clearInterval(switch_button_task_id);//既然已经发现状态改变，执行完改变后立刻停止轮询
			}
		})
	},500)		

}
function switch_button_color(switch_button,status){
	switch(status){
		case 0:switch_button.style["background-color"]="#b0c9f7";break;
		case 1:switch_button.style["background-color"]="#36f";break;
	}
	
}
function executeBak(){
    execute('startBak');
}
function executeRestart(){
    execute("restart");
}
function show_settings_form(){
	//https://blog.csdn.net/qq_35727582/article/details/114868023
	document.getElementById("settings_form").style.display="block"
	for(let i=1;i<=3;i++){
		//初始化各项配置
		initSimpleShortcutConf(i)
		setShortcutButtonTitle(i);
	}
}
function hide_settings_form(){
	document.getElementById("settings_form").style.display="none"
}
////////////
function initSimpleShortcutConf(number){
	//先初始化当前按钮的配置
	const conf=new JsonWeb(getConf(),["server_conf",host,"simple_shortcut_cmd_list"])
	conf.init(number,{});
	//初始化各项配置
	const shortcut_conf=new JsonWeb(getConf(),["server_conf",host,"simple_shortcut_cmd_list",number])
	shortcut_conf.init("cmd","")
	shortcut_conf.init("title","快捷按钮"+number)
}
function show_simple_shortcut_custom_form(number){
	//先把输入框里的内容改成保存的内容
	document.getElementById("set_simple_shortcut_form_textarea").value=getSimpleShortcutCmd(number)
	document.getElementById("set_simple_shortcut_form_title_textarea").value=getSimpleShortcutConf(number).title
	//使窗口显示
	document.getElementById("set_simple_shortcut_form_overlay").style.display="block"
	//将隐藏的html段落设置为当前的序号供后面读取
	document.getElementById("set_simple_shortcut_form_edited_button_number").innerHTML=number
}
function hide_simple_shortcut_custom_form(){
	document.getElementById("set_simple_shortcut_form_overlay").style.display="none"
}
function save_simple_shortcut_custom_form(){
	const number=Number(document.getElementById("set_simple_shortcut_form_edited_button_number").innerHTML)
	const shortcut_confs=new JsonWeb(getConf(),["server_conf",host,"simple_shortcut_cmd_list"])
	let shortcut_conf=shortcut_confs.get(number)
	shortcut_conf.cmd=document.getElementById("set_simple_shortcut_form_textarea").value
	shortcut_conf.title=document.getElementById("set_simple_shortcut_form_title_textarea").value
	shortcut_confs.set(number,shortcut_conf);
	setShortcutButtonTitle(number)
	//init_simple_shortcut_cmd_list(host,number)
	hide_simple_shortcut_custom_form()
}
function getSimpleShortcutCmd(number){
	const shortcut_conf=new JsonWeb(getConf(),["server_conf",host,"simple_shortcut_cmd_list",number])
	return shortcut_conf.get("cmd");
}
function getSimpleShortcutConf(number){
	const shortcut_confs=new JsonWeb(getConf(),["server_conf",host,"simple_shortcut_cmd_list"])
	return shortcut_confs.get(number);
}
function executeSimpleShortcut(number){
	initSimpleShortcutConf(number)
	execute(getSimpleShortcutCmd(number))
}
function setShortcutButtonTitle(number){
	const shortcut_conf=new JsonWeb(getConf(),["server_conf",host,"simple_shortcut_cmd_list",number])
	const title=shortcut_conf.get("title")
	document.getElementById("simple_shortcut"+number).innerHTML=title;
	document.getElementById("show_simple_shortcut_custom_form"+number).innerHTML=title;
}
/*
////////////////
function init_simple_shortcut_cmd_list(host,number){
	//这里不用初始化，get已经初始化完了
	let conf=getServerConfObj(host,"simple_shortcut_cmd_list")
	if(conf[number]===undefined||!(conf[number] instanceof Object))conf[number]={};
	setServerConfObj(host,"simple_shortcut_cmd_list",conf);
}
function get_simple_shortcut_cmd_list(host,number){
	return getServerConfObj(host,"simple_shortcut_cmd_list")[number]
}
function set_simple_shortcut_cmd_list(host,number,value){
	let conf=getServerConfObj(host,"simple_shortcut_cmd_list")
	conf[number]=value;
	setServerConfObj(host,"simple_shortcut_cmd_list",conf)
}

function init_simple_shortcut_cmd_list_conf_obj(host,number,key,value){
	let conf=get_simple_shortcut_cmd_list(host,number);
	if(conf[key]===undefined||conf[key].constructor!=)conf[key]=value;
	setServerConfObj(host,"simple_shortcut_cmd_list",conf);
}
*/

function logout(){
 	//清除cookie中的地址和地址和token
	localStorage.removeItem("host");
	localStorage.removeItem("token");
	//跳转至登录页面
    indextologin({reason:"logout"})
}
function getHardwareStatus(callback){
	if(isDLSProtocol()){
        const requestUID=generateToken()
        ServerEvents.expectations.add({
            type:"fetch_hardware_status_result",
            requestUID,
            callback:msg=>{
                callback(msg.data)
            }
        })
		sendData(JSON.stringify({
			type:"fetch_hardware_status",
			requestUID
		}))
	}
	else{
		var settings = {
			"url": host+"/server_status",
			"method": "GET",
			"timeout": 0,
			"headers": {
			},
		};

		$.ajax(settings).done(function (response) {
			callback(response);
		}).fail((jqXHR, textStatus, errorThrown) => {
			
			switch(jqXHR.status){
				case 502:
					notify("error","目前无法连接至DLS API所在的远程服务器，错误码：502")
					break;
				default:
					notify("error","请求服务器状态时发生未知错误：\n"+errorThrown);
					break;
			}
		});
	}
}
async function refreshHardwareStatus(){
    //判断当前是否位于cpuchart所在页面
	//如果不位于，那么发出信号
	//对于未加载完毕的情况也有用，因为未加载完毕的情况真正该加载cpuchart的页面也会认为自己不应该加载并发信号，最后就没有人响应了
    if(!document.getElementById("cpuchart")?.contentWindow?.updateCPUStatus){
        window.parent.postMessage({type:"refreshHardwareStatus",data:{}},'*')
		//如果未加载，那么应该提示调用方自己此时无法执行
        return {}
    }
	return new Promise(resolve=>getHardwareStatus(response=>{
		document.getElementById("cpuchart").contentWindow.updateCPUStatus(response.cpu_rate)
		updateMemStatus(response.mem_used,response.mem_total);
		updateDiskStatus(response.disks_info)
		resolve(response)
	}))
}
window.addEventListener('message', e=>{
	if(e.data.type==="refreshHardwareStatus"){
		//如果自己不是目标页面或此时还未加载，那么直接不处理
		if(!document.getElementById("cpuchart")?.contentWindow?.updateCPUStatus)return;
		refreshHardwareStatus();
	}
})	
function updateMemStatus(memUsed,memTotal){
	document.getElementById("mem_column").style.width="calc(calc(100% - 50px) * "+(memUsed/memTotal).toString()+")"
	document.getElementById("mem_button").innerHTML=memUsed+"MB/"+memTotal+"MB"
}
let cachedDiskList=[]
function updateDiskStatus(diskList){
	cachedDiskList=diskList;
	const selectedDisk=(()=>{
		//初始化当前服务器的盘符
		if(!getConfObj("disk_info_selected_symbol")[host]){
			let diskConf=getConfObj("disk_info_selected_symbol")
			diskConf[host]=diskList[0].symbol;
			setConfObj("disk_info_selected_symbol",diskConf);
		}
		//返回当前选择的盘符
		return getConfObj("disk_info_selected_symbol")[host]
		//return "C:"
	})()
	document.getElementById("disk_column").style.width="calc(calc(100% - 50px) * "+(()=>{
		for(let disk of diskList){
			if(disk.symbol===selectedDisk){
				//改变文字显示
				document.getElementById("disk_switch_button").innerHTML=disk.symbol+"   "+disk.disk_used+"GB/"+disk.disk_total+"GB";
				//改变图表状态
				return disk.disk_used/disk.disk_total;;
			}
		}
		return 0;
	})().toString()+")"
}
function switchDiskSymbol(){
	for(let i in cachedDiskList){
		if(cachedDiskList[i].symbol==getConfObj("disk_info_selected_symbol")[host]){

			let diskConf=getConfObj("disk_info_selected_symbol")
			diskConf[host]=cachedDiskList[(Number(i)+1)%cachedDiskList.length].symbol;
			setConfObj("disk_info_selected_symbol",diskConf)
			break;
		}
	}
	updateDiskStatus(cachedDiskList);
}
let load_request_interval=1000;
//getHardwareStatus((response)=>{});