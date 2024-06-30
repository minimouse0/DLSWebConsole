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
}
function initConfObj(key,value){
	let conf=JSON.parse(parseCookie("config"));
	if(conf[key]===undefined||conf[key].constructor!=value.constructor)conf[key]=value;
	document.cookie="config="+JSON.stringify(conf)+";SameSite=Strict";
}
function setConfObj(key,value){
	let conf=JSON.parse(parseCookie("config"));
	conf[key]=value;
	document.cookie="config="+JSON.stringify(conf)+";SameSite=Strict";
}
function getConfObj(key){
	return JSON.parse(parseCookie("config"))[key]
}