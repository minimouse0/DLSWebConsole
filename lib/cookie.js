function parseCookie(key){
	for(let data of document.cookie.split(";")){
		if(data.match(`${key}=(.+)`)!=null) return data.match(`${key}=(.+)`)[1]
	}
	return ""
}
function indextologin(reason){	
	sessionStorage.setItem("loginRequiredReason",JSON.stringify(reason))
    location.href="login.html";
}
function logintoindex(){
	
    location.href ="index.html"
}
function resetConf(){
	localStorage.setItem("config","{}");
}
function initConf(){
	//初始化用户配置
	if([null,""].includes(localStorage.getItem("config")))resetConf()
	initConfObj("auto_scroll",true)
	initConfObj("disk_info_selected_symbol",{})
	initConfObj("server_conf",{})
}
function getConf(){
	try{
		return JSON.parse(localStorage.getItem("config"))
	}
	catch(e){
		console.error("解析错误\n错误为："+e+"\n字符串为："+localStorage.getItem("config"))
		console.warn("由于配置文件出现不可恢复错误，将强制重置配置文件。")
		//重置配置文件
		resetConf();
		initConf();
		return getConf();
	}
}
function initConfObj(key,value){
	let conf=getConf();
	if(conf[key]===undefined||conf[key].constructor!=value.constructor)conf[key]=value;
	localStorage.setItem("config",JSON.stringify(conf));
}
function setConfObj(key,value){
	let conf=getConf();
	conf[key]=value;
	localStorage.setItem("config",JSON.stringify(conf));
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