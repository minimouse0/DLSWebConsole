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