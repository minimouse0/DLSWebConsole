let server_address=undefined

let socket
let connectionOpened=false

let wsRetryTimes=0

function isDLSProtocol(){
    return localStorage.getItem("host").startsWith("wss://")||localStorage.getItem("host").startsWith("ws://")
}

function refreshWSConnection(server_address){
    socket = new WebSocket(server_address+"?token="+token);
    socket.onerror=event=>{
        console.log('Error type:', event.type); 
        console.log('WebSocket state:', event.target.readyState);
        if(wsRetryTimes<5){
            wsRetryTimes++
            notify("warn","websocket连接断开，正在重试:第"+wsRetryTimes+"次")
            refreshWSConnection(server_address)
        }
        else showBrowserCertificateBlockedPopup()
        /*
        checkIPv6().then(result =>{
            if(result){
                showGeneralAlert("当前无法连接到服务器。如果正在使用代理（例如梯子），请关闭代理后再试，如果仍然无法连接服务器，请联系管理员。")
            }
            else{
                showGeneralAlert("当前网络环境不支持ipv6，请换用手机流量访问本站，然后再试一次")
            }
        });
        */
    }
    //连接建立成功时触发此函数
    socket.onopen =event=> {
        connectionOpened=true
        console.log('Connection opened');
        wsRetryTimes=0;
        //showGeneralAlert("websocket成功，连接已建立")
        // 接收到后端消息时触发
        socket.addEventListener("message", event=> {
            //if(new RegExp(/username/).test(e.data.toString()))alert("发生未处理的错误：\n"+e.data)
            let parsedResult={}
            try{
                parsedResult=JSON.parse(event.data)
            }
            catch(e){
                notify("error","服务器发送的数据无法被正常处理，请联系管理员。以下是详细的错误：\n"+e)
                console.log(event.data)
                console.log("服务器发送了破损的数据："+e)
                return
            }
            ServerEvents.serverMsgHandler(parsedResult)
        });
        ServerEvents.onWSOpen.forEach(fn=>fn(event))
    };
    socket.onclose=event=>{
        if(event.code===4001){
            indextologin({reason:"tokenIncorrect"})
        }
        else{
            notify("error","连接已关闭：\n"+JSON.stringify(event,undefined,4))
        }
    }
}

// getWSAddress().then(result=>{
//     wsRetryTimes=0
//     refreshWSCoonnection(result)
// })




class ServerEvents{
    static onWSOpen=[]
    static onConsoleUpdate=[]
    static onProcessStatusUpdate=[]
    static expectations=new Set()
    static onErrorMsg=msg=>{
        switch(msg.error){
            //token错误会导致跳转至登录界面
            case "token_incorrect":location.href="login.html";break;
            default:notify("error","暂时无法处理的错误："+msg.error)
        }
    }
    static serverMsgHandler(msg){
        const {type,requestUID}=msg
        for(let expectation of ServerEvents.expectations){
            if(type===expectation.type&&requestUID===expectation.requestUID){
                expectation.callback(msg)
                ServerEvents.expectations.delete(expectation)
                return;
            }
        }
        switch(type){
            case "console_update":{
                ServerEvents.onConsoleUpdate.forEach(callback=>callback(msg))
                break;
            }
            case "fetch_process_status":
            case "process_status_update":{
                ServerEvents.onProcessStatusUpdate.forEach(callback=>callback(msg))
                break;
            }
            case "hardware_status_update":{
                ServerEvents.onHardwareStatusUpdate.forEach(callback=>callback(msg))
                break;
            }
            case "error":{
                ServerEvents.onErrorMsg(msg)
                break;
            }
            case "hb":break;
            default:throw new Error("不支持的行为："+type)
        }        
    }
}

function sendData(data){
    if(!connectionOpened){
        console.error("发送"+data+"时websocket还没有建立连接")
        return
    }
    try{
        const parsedData=JSON.parse(data)
        if(typeof parsedData!="object")throw new Error("发送的数据不是对象")
    }
    catch(e){
        console.error("json解析错误："+e)
        console.error("将要被发送的数据："+data)
        return
    }
    socket.send(data)    
}

//////////往下就没啥用了

// 在浏览器中使用简单的随机数生成器
function generateToken() {
    return 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
function submitRawJSON(){
    const rawStr=document.getElementById("sendRawJSON").value
    sendData(rawStr)
}
//当没有token时生成token
// if(parseCookie("token")==undefined){
//     const token=generateToken()
//     document.cookie="token="+token+"; SameSite=Lax;"
// }

async function getWSAddress() {
    try {
        const url=location.href
        const urls=url.split("/")
        const protocol=urls[0]
        const host=urls[2]
        const root=protocol+"//"+host
        const response = await fetch("./ws_address.txt");
        if (!response.ok) {
            throw new Error('无法获取websocket地址');
        }

        return await response.text();

    } catch (error) {
        //console.error('Error fetching IPv6 address:', error);
        return false;
    }
}
async function checkTarget() {
    try {
        const response = await fetch(server_address.replace("wss","https"));
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.text();
        console.log(result)
        return true

    } catch (error) {
        //console.error('Error fetching IPv6 address:', error);
        return false;
    }
}
//以下函数是以前在恶劣网络环境下使用的
async function checkIPv6() {
    try {
        const response = await fetch('https://6.ipw.cn');
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const ipv6Address = await response.text();
        
        // 这里假设返回的内容是一个有效的IPv6地址，可以根据需要进一步验证地址格式
        const ipv6Pattern = /^[0-9a-fA-F:]{2,39}$/;
        return ipv6Pattern.test(ipv6Address);

    } catch (error) {
        //console.error('Error fetching IPv6 address:', error);
        return false;
    }
}
function isSafari() { 
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent); 
}
// if (isSafari()) { 
    //alert('本站暂不支持safari，请使用其他浏览器访问'); 
// }
// 使用函数


function showBrowserCertificateBlockedPopup(){
    // 创建遮罩层
    let overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'none';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    document.body.appendChild(overlay);

    // 创建浮窗
    let popup = document.createElement('div');
    popup.style.backgroundColor = '#fff';
    popup.style.padding = '20px';
    popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
    popup.style.position = 'relative';
    overlay.appendChild(popup);

    // 创建关闭按钮
    // var closeButton = document.createElement('span');
    // closeButton.innerHTML = '×';
    // closeButton.style.position = 'absolute';
    // closeButton.style.top = '10px';
    // closeButton.style.right = '10px';
    // closeButton.style.cursor = 'pointer';
    // closeButton.onclick = function() {
    //     overlay.style.display = 'none';
    // };
    // popup.appendChild(closeButton);

    // 添加浮窗内容
    const userUnlockAPIURL=server_address.replace("ws","http")
    let popupContent = document.createElement('div');
    popupContent.innerHTML = `无法连接至服务器，这可能是您的网络设置有问题，或服务器网络出现问题<br>
请刷新页面重试<br>
如果反复刷新页面仍然有此弹窗，证明服务器确实可能已停机，请联系管理员<br>
    `
//请进入这个网页：<a href='${userUnlockAPIURL}'>${userUnlockAPIURL}</a><br>
//详细的操作步骤可以参考<a href='docs/#/cantaffordexpensivesslcert'>官网弹窗无法连接至服务器</a><br>
;
    popup.appendChild(popupContent);

    // 显示浮窗
    overlay.style.display = 'flex';

}