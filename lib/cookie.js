function parseCookie(key){
	for(let data of document.cookie.split(";")){
		if(data.match(`${key}=(.+)`)!=null) return data.match(`${key}=(.+)`)[1]
	}
	return ""
}
function indextologin(){	
    location.href =window.location.href.replace("index.html","login.html");
}
function logintoindex(){
	
    location.href =window.location.href.replace("login.html","index.html");
}