cookie_data = parseCookie();
const host = cookie_data["host"];
const token = cookie_data["token"];

function scrollToBottom(){}
function defscroller(){
//文心一言生成的自动滚动到最底部的函数，不一定完全能用
// 获取当前文档对象
let doc = document;
// 判断浏览器类型并选择相应的滚动函数
if (doc.documentElement && doc.scrollTop) { // IE6+、Chrome、Firefox等现代浏览器
    scrollToBottom=()=>{
        if (doc.body) {
            window.scroll(0, doc.body.offsetHeight);
        } else {
            // 等待body元素加载完成后再滚动
            setTimeout(scrollToBottom, 100);
        }
    }
} else if (doc.body.scrollLeft || doc.body.scrollTop) { // Safari及IE5/Mac上的Quirks模式
    scrollToBottom=()=>{
        if (doc.body) {
            window.scrollBy(0, doc.body.offsetHeight - window.innerHeight);
        } else {
            // 等待body元素加载完成后再滚动
            setTimeout(scrollToBottom, 100);
        }
    }
}
};
let wait_scroller=setInterval(()=>{
    let doc = document;
    if(doc.body||doc.scrollTop){
        defscroller();
        clearInterval(wait_scroller);
    }
},100);

let current_log_id=0;
let logs=[];
let last_new_log=new Date();
function refresh_console(){
    let settings = {
        "url": host+"/terminal_log?token="+token+"&log_id="+current_log_id.toString(),
        "method": "GET",
        "timeout": 0,
        "beforeSend": (XMLHttpRequest)=>{
            XMLHttpRequest.setRequestHeader("Content-Type", "application/json");
        }
    };

    $.ajax(settings).done(function (response) {
        logs=merge_log(logs,response.log_list);
        //直接将整个控制台内容替换
        document.getElementById("console_log").innerHTML=parse_log(logs)
        //刷新流程执行完毕，将此次刷新得到的最后一个log id保存
        if(response.log_list.length){//如果列表里有东西证明刚刚有新输出，刷新log id和上次新log时间戳
            last_new_log=new Date();
            current_log_id=response.log_list[response.log_list.length-1].log_id;
            //有新输出，刷新完成后自动滚动到控制台底部
            var height = document.body.scrollHeight;
            window.scroll({ top: height , left: 0, behavior: 'smooth'})
        }
    });
}
//此函数用于下面函数中新日志不连续的情况，因为日志不连续会造成拼接出现问题
//无需考虑旧日志是否有不连续的部分，算法决定了旧日志连续性不影响拼接
function patch_new_log(){

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
    if(!logs.length){//如果旧日志长度是空的，证明新日志是第一段被拼接进来的日志
        return new_logs;
    }
    let coincide_length=logs[logs.length-1].log_id-new_logs[new_logs.length-1].log_id+1;
    if(coincide_length>=0){
        return logs.concat(new_logs);
    }
    if(coincide_length>=new_logs.length){
        return logs;
    }
    new_logs.splice(0,coincide_length);
    return logs.concat(new_logs);
}
//简单粗爆地把所有输出信息合到一起，后面打算弃用，因为太💩了
function parse_log(logs){
    let log_raw_text="";
    for(log of logs){
        log_raw_text=log_raw_text+log.text+"<br>";
    }
    //添加空行来保证不输出不被下面输入框挡住
    log_raw_text=log_raw_text+"<br><br><br>";
    return log_raw_text;
}
setInterval(()=>{
    refresh_console();
    //如果上次输出在1.3s内，就以每秒5次的速度快速轮询直至上次输出超时，即检测到新输出则立刻活跃1.5s然后放慢速度
    if(new Date().getTime()-last_new_log.getTime()<1300){
        let active_console=setInterval(()=>{
            refresh_console();
            if(new Date().getTime()-last_new_log.getTime()>1500){//一旦上次输出超时，立刻结束轮询
                clearInterval(active_console);
            }
        },200)
    }
},1000);