"use strict";
const console_color_table={
    "0":"white"
}

/**把控制台输出内容滚动到底部 */
function scrollToBottom(){
    var height = document.body.scrollHeight;
    window.scroll({ top: height , left: 0})  
}
/*;
*/

let current_log_id=0;
/** 在浏览器中存储的完整log列表 */
let logs=[];
let last_new_log=new Date();
/**用于存储上一行的颜色代码，用于下一行的开头 */
// let last_line_color_code="0";
async function refresh_console(){
    try{
        let settings = {
            "url": host+"/terminal_log?token="+token+"&log_id="+current_log_id.toString(),
            "method": "GET",
            "timeout": 0,
            "beforeSend": (XMLHttpRequest)=>{
                XMLHttpRequest.setRequestHeader("Content-Type", "application/json");
            }
        };

        await new Promise((resolve,reject)=>$.ajax(settings).done(response=>{
            //console.log(response)
            logs=merge_log(logs,response.log_list);
            //直接将整个控制台内容替换
            document.getElementById("console_log").innerHTML=parse_log(logs)
            //刷新流程执行完毕，将此次刷新得到的最后一个log id保存
            if(response.log_list.length){//如果列表里有东西证明刚刚有新输出，刷新log id和上次新log时间戳
                last_new_log=new Date();
                current_log_id=response.log_list[response.log_list.length-1].log_id;
                //有新输出，刷新完成后自动滚动到控制台底部
                if(getConfObj("auto_scroll"))scrollToBottom();

            }
            resolve()
        }).fail((jqXHR, textStatus, errorThrown) => {
            switch(jqXHR.status){
                case 403:
                    //跳转回登录界面
                    window.parent.postMessage({type:"toLogin",data:{reason:"tokenIncorrect"}})
                    break;
                case 502:
                    reject("目前无法连接至DLS API所在的远程服务器，错误码：502")
                    break;
                default:
                    reject(errorThrown);
                    break;
            }
        }));        
    }catch(e){
        notify("error","刷新控制台时出错：\n"+e+"\n本次不刷新。");
    }

}

function merge_log(logs,new_logs){
    /*旧日志尾部id logs[logs.length-1].log_id
    新日志头部id new_logs[new_logs.length-1].log_id
    需要计算新旧日志重合的部分
    这个部分的长度为旧日志尾部id-新日志头部id+1
    由于可能中间会丢一部分日志导致id不连续，造成长度为负，后面需要对负数做一下排除
    具体算法是长度为0或负则证明日志没有重合，直接拼接即可
    计算好旧日志的长度之后，将新日志头部削去相应长度，即可完美对接
    如果新日志自身长度小于等于重合长度，则证明完全没有必要进行拼接
    */
    if(!new_logs.length){//如果新日志长度是空的，证明没有任何东西要拼接，直接返回旧日志
        return logs;
    }
    if(!logs.length){//如果旧日志长度是空的，证明新日志是第一段被拼接进来的日志，那么整个日志内容肯定就是新日志内容
        return new_logs;
    }
    //如果新日志的最后logid还没有旧日志大，证明返回来的所有内容都不需要拼接，那么直接返回旧日志
    if(new_logs[new_logs.length-1].log_id<=logs[logs.length-1].log_id){
        return logs;
    }
    /*
    //旧日志最后的id减新日志的最后的id就是重合的长度
    let coincide_length=logs[logs.length-1].log_id-new_logs[new_logs.length-1].log_id+1;
    if(coincide_length>=0){
        return logs.concat(new_logs);
    }
    if(coincide_length>=new_logs.length){
        return logs;
    }
    new_logs.splice(0,coincide_length);
    return logs.concat(new_logs);*/
    //如果新日志的头部id大于旧日志的尾部id，证明两者没有重合部分，直接拼接
    if(new_logs[0].log_id>logs[logs.length-1].log_id)return logs.concat(new_logs);
    //如果新日志的善id不是大于（小于等于）旧日志的尾部id，证明两者有重合部分
    //旧日志的尾部id减新日志的头部id再加一就是重合的长度
    let coincide_length=logs[logs.length-1].log_id-new_logs[0].log_id+1;
    //将新日志从头删除重合长度的行数
    new_logs.splice(0,coincide_length);
    return logs.concat(new_logs);
}


//简单粗爆地把所有输出信息合到一起，后面打算弃用，因为太💩了
function parse_log(logs){
    let log_raw_text="";
    for(let log of logs){
        
        //拼接当前行
        //使用转换函数将带颜色的输出转换后再显示
        log_raw_text=log_raw_text+color_html_convert(log);
        //在最后加上一个换行符
        log_raw_text=log_raw_text+"<br>";

    }
    //添加空行来保证不输出不被下面输入框挡住
    // log_raw_text=log_raw_text+"<br><br><br>";
    return log_raw_text;
}
function appendConsoleLog(log){
    
    const newLogsContainer=document.createElement('span')
    newLogsContainer.innerHTML=color_html_convert(log)
    document.getElementById("console_log").appendChild(newLogsContainer).appendChild(document.createElement('br'))
    if(getConfObj("auto_scroll"))scrollToBottom();
}
let consoleActive=false;
let consoleHistoryFetched=false;
$(()=>{(async ()=>{
if(isDLSProtocol()){
    ServerEvents.onAuthed.push(()=>{
        if(consoleHistoryFetched)return;
        //首先从服务器获取所有日志
        const requestUID=generateToken()
        ServerEvents.expectations.add({
            type:"fetch_all_server_logs_result",
            requestUID,
            callback:msg=>{
                msg.data.forEach(log=>
                    appendConsoleLog(log)
                )
            }
        })
        sendData(JSON.stringify({
            type:"fetch_all_server_logs",
            serverName,
            requestUID
        }))
        consoleHistoryFetched=true;
    })

    //使用DLSProtocol时，监听到控制台更新内容时，在现有控制台区域附加日志文本
    ServerEvents.onConsoleUpdate.push(msg=>{
        msg.data.forEach(log=>{
            appendConsoleLog(log)
        })
    })
}
else{
    while(1){
        //刷新控制台
        refresh_console();
        //如果上次输出在3s内，就快速轮询直至上次输出超时，即检测到新输出则立刻活跃一会然后放慢速度
        if(Date.now()-last_new_log.getTime()<3000)consoleActive=true
        //如果确实是超时了就放慢速度
        else consoleActive=false
        //开始按指定时间进行等待
        await new Promise(resolve=>setInterval(resolve,400))
        //如果控制台不活跃，那么刷新硬件状态后再等待600ms，如果控制台活跃，那么跳过状态刷新，把所有的机会留给控制台
        if(!consoleActive){
            refreshHardwareStatus().catch(e=>notify("error","无法刷新硬件状态："+e))
            await new Promise(resolve=>setInterval(resolve,600))
        }

    }
}
})()})
function beActive(){
    consoleActive=true;
    last_new_log=new Date()
    //不论如何，强制激活时必须立即刷新控制台
    //按最坏的情况来看，需要在执行完命令的200ms和400ms后各刷新一次
    setTimeout(refresh_console,200)
    setTimeout(refresh_console,400)
}
//监听其他网页部分发来的激活控制台高速刷新请求
window.addEventListener('message', e=>{
	if(e.data.type==="activeConsole"){
		beActive();
	}
})	
function update_console_toolbox(){
    update_auto_scroll_switch();
}

function switch_auto_scroll(){
    setConfObj("auto_scroll",!getConfObj("auto_scroll"))
    update_auto_scroll_switch();
}
function update_auto_scroll_switch(){
    let switch_button=document.getElementById("switch_auto_scroll");
    switch_button.style["background-color"]=getConfObj("auto_scroll")?"#36f":"#b0c9f7";
}
