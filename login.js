let page=0

function onLoginClick(){
    const form = document.getElementById("login_info");
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
    localStorage.setItem("serverName",form.server_name.value);
    //保存此次输入的凭据
    const oldSavedCredentials=JSON.parse(localStorage.getItem("credentials"))
    oldSavedCredentials[form.url.value+"?"+form.server_name.value]=form.token.value;
    localStorage.setItem("credentials",JSON.stringify(oldSavedCredentials))
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
            //console.log(document.getElementById('url').value)
            document.getElementById('url').value=localStorage.getItem("host");
            notify("warn","token错误，请重新输入")
            break;
    }
    //初始化本地保存的凭据列表
    if(localStorage.getItem("credentials")==null)localStorage.setItem("credentials","{}")
    try{
        JSON.parse(localStorage.getItem("credentials"))
    }
    catch(e){
        notify("error","本地存储的凭据列表已损坏，因此将其重置。")
        localStorage.setItem("credentials","{}")
    }
    refreshUICredentials()
    $(document).on('keydown', function(e) {
        //监听到回车键就登录
        if(e.which===13)onLoginClick();
    })
    
})
function showHistory(){
	document.getElementById("history_form").style.display="block"
}
function hideHistory(){
    
	document.getElementById("history_form").style.display="none"
}

function useCredential(address,serverName){
    const form = document.getElementById("login_info");
    form.url.value=address
    form.server_name.value=serverName
    form.token.value=JSON.parse(localStorage.getItem("credentials"))[address+"?"+serverName]
    //设置完毕后记得关闭表单
    hideHistory()
}

function deleteCredential(address,serverName){
    const oldCredentials=JSON.parse(localStorage.getItem("credentials"))
    delete oldCredentials[address+"?"+serverName]
    localStorage.setItem("credentials",JSON.stringify(oldCredentials))
    //删除后重置窗口中的内容
    refreshUICredentials(page)
}

function refreshUICredentials(){
    //先清除其中所有内容
    
    document.getElementById("history_form_table").innerHTML=""
    Object.keys(JSON.parse(localStorage.getItem("credentials"))).forEach(key=>{
        const parsedCredentialIndex=key.split("?")
        if(parsedCredentialIndex.length!=2){
            notify("error","有无法解析的凭据："+key+"，现在将删除它。");
            const oldCredentials=JSON.parse(localStorage.getItem("credentials"))
            delete oldCredentials[key]
            localStorage.setItem("credentials",JSON.stringify(oldCredentials))
            return;
        }
        const address=parsedCredentialIndex[0]
        const serverName=parsedCredentialIndex[1]
        addCredential2UI(address,serverName)
    })
}

function addCredential2UI(address,serverName){
    //处理历史记录选择框中的内容
    const selectRegion=document.getElementById("history_form_table")
    const line=document.createElement('div')
    line.className="history_form_line"

    const addressDisplay=document.createElement('button')
    addressDisplay.className="address_display"
    addressDisplay.id="credential_address"
    addressDisplay.innerHTML=(address.length>24)?address.slice(0,16)+"..."+address.slice(address.length-5):address
    line.appendChild(addressDisplay)

    const block=document.createElement('div')
    block.className="history_form_line_block"
    line.appendChild(block)

    const serverNameDisplay=document.createElement('button')
    serverNameDisplay.className="server_name_display"
    serverNameDisplay.id="credential_server_name"
    serverNameDisplay.innerHTML=serverName
    line.appendChild(serverNameDisplay)
    line.appendChild(block.cloneNode())

    
    const deleteButton=document.createElement('button')
    deleteButton.className="round_button"
    deleteButton.id="delete_history"
    deleteButton.onclick=()=>deleteCredential(address,serverName)
    line.appendChild(deleteButton)
    const deleteButtonImage=document.createElement('img')
    deleteButtonImage.className="round_button_image"
    deleteButtonImage.src="maps/delete.png"
    deleteButton.appendChild(deleteButtonImage)
    line.appendChild(block.cloneNode())
    
    const useButton=document.createElement('button')
    useButton.className="round_button"
    useButton.id="use_credential"
    useButton.onclick=()=>useCredential(address,serverName)
    line.appendChild(useButton)
    const useButtonImage=document.createElement('img')
    useButtonImage.className="round_button_image"
    useButtonImage.src="maps/right.png"
    useButton.appendChild(useButtonImage)

    selectRegion.appendChild(line)

    const lineBreak=document.createElement('br')
    selectRegion.appendChild(lineBreak)
}