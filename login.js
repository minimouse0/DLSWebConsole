function onLoginClick(){
    let form = document.getElementById("login_info");
    //未填写地址时不登录
    if(form.url.value==""){
        notify("error","请填写服务器API地址");
        return;
    }
    if(form.token.value==""){
        notify("error","请填写服务器API的token");
        return;
    }
    localStorage.setItem("host",form.url.value);
    localStorage.setItem("token",form.token.value);
    // 跳转到指定的 URL 地址
    //如果URL其他位置含有login，或访问没有带.html就会跳转时发生错误或无法跳转
    logintoindex()
}
//网页加载完毕时运行
$(()=>{
    const loginRequiredReason=JSON.parse(sessionStorage.getItem("loginRequiredReason"))
    switch(loginRequiredReason.reason){
        case "noCredentials":
            //弹窗告诉用户被跳转到登录界面的原因是登录凭据丢失
            notify("info","没有在浏览器中找到任何有效的已存储登录凭据。请重新输入登录凭据。")
            break;
        case "logout":
            //什么也不用做
            break;
        case "tokenIncorrect":
            //帮用户把host填好
            console.log(document.getElementById('url').value)
            document.getElementById('url').value=localStorage.getItem("host");
            notify("warn","token错误，请重新输入")
            break;
    }
    
    $(document).on('keydown', function(e) {
        //监听到回车键就登录
        if(e.which===13)onLoginClick();
    })
})