function onLoginClick(){
    let form = document.getElementById("login_info");
    localStorage.setItem("host",form.url.value);
    localStorage.setItem("token",form.token.value);
    // 跳转到指定的 URL 地址
    //如果URL其他位置含有login，或访问没有带.html就会跳转时发生错误或无法跳转
    logintoindex()
}
//网页加载完毕时运行
$(()=>{
    if(!(localStorage.getItem("host")?.length&&localStorage.getItem("token"))){
        //弹窗告诉用户被跳转到登录界面的原因是登录凭据丢失
        notify("info","没有在浏览器中找到任何有效的已存储登录凭据。请重新输入登录凭据。")
    }
})