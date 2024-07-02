function parseCookie(key){
	for(let data of document.cookie.split(";")){
		if(data.match(`${key}=(.+)`)!=null) return data.match(`${key}=(.+)`)[1]
	}
	return ""
}
function indextologin(){	
    location.href="login.html";
}
function logintoindex(){
	
    location.href ="index.html"
}
function initConf(){
	//初始化用户配置
	if(parseCookie("config")==""){
		document.cookie="config={}; SameSite=Strict;";
	}
	initConfObj("auto_scroll",true)
	initConfObj("disk_info_selected_symbol",{})
	initConfObj("server_conf",{})
}
function getConf(){
	try{
		return JSON.parse(parseCookie("config"))
	}
	catch(e){
		console.error("解析错误\n错误为："+e+"\n字符串为："+parseCookie("config"))
		console.warn("由于配置文件出现不可恢复错误，将强制重置配置文件。")
		//重置配置文件
		document.cookie="config={}; SameSite=Strict;";
		initConf();
		return getConf();
	}
}
function initConfObj(key,value){
	let conf=getConf();
	if(conf[key]===undefined||conf[key].constructor!=value.constructor)conf[key]=value;
	document.cookie="config="+JSON.stringify(conf)+";SameSite=Strict";
}
function setConfObj(key,value){
	let conf=getConf();
	conf[key]=value;
	document.cookie="config="+JSON.stringify(conf)+";SameSite=Strict";
}
function getConfObj(key){
	return getConf()[key]
}




function initServerConf(host){
	initConfObj("server_conf",{})
	let conf=getConfObj("server_conf");
	if(conf[host]===undefined||!(conf[host] instanceof Object))conf[host]={};
	setConfObj("server_conf",conf)
}
function initServerConfObj(host,key,value){
	initServerConf(host)
	let conf=getConfObj("server_conf");
	if(conf[host][key]===undefined||conf[host][key].constructor!=value.constructor)conf[host][key]=value;
	setConfObj("server_conf",conf)
}
function getServerConfObj(host,key){
	initServerConf(host)
	return getConfObj("server_conf")[host][key];
}
function setServerConfObj(host,key,value){
	initServerConf(host)
	let conf=getConfObj("server_conf");
	conf[host][key]=value;
	setConfObj("server_conf",conf)
}