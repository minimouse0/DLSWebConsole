"use strict";
const console_color_table={
    "0":"white"
}

/**把控制台输出内容滚动到底部 */
function scrollToBottom(){
    var height = document.body.scrollHeight;
    window.scroll({ top: height , left: 0})  
}
/*
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
*/

let current_log_id=0;
/** 在浏览器中存储的完整log列表 */
let logs=[];
let last_new_log=new Date();
/**用于存储上一行的颜色代码，用于下一行的开头 */
let last_line_color_code="0";
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
            if(getConfObj("auto_scroll"))scrollToBottom();

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








function color_html_convert_deprecated(log){
    let color_text_html=""
    //把所有的\u001b字符转换以便后面操作的时候一些函数能识别
    //前面添加上一行的颜色代码来继承上一行颜色，末尾添加一个白色的颜色代码方便后面一次性分割
    let color_text=`\u001b[${last_line_color_code}m`+log.color_text//+"\u001b[0m";
    //第一步：把所有颜色代码分片
    let color_slices=color_text.split(/\u001b\[/)
    //第二步：提取所有颜色代码后面的内容
    let color_slices_html=[]
    for(let color_slice of color_slices){
        //console.log(JSON.stringify(log.color_text));
        //如果当前这个切片是空的，后面就无法处理，跳过
        if(color_slice=="")continue;
        //提取切片前部的颜色代码
        let color_code="0"
        let text=""
        if(color_slice.match(/(.+?)m/)){
            color_code=color_slice.match(/(.+?)m/)[1];
            //去掉颜色代码提取文本
            text=color_slice.replace(color_code+"m","");
        }//如果上面没有匹配，证明不存在颜色代码
        else{
            color_code="0";
            text=color_slice;
        }
        //第三步：解析颜色代码
        let html_color=""
        let color_code_nums=color_code.split(";")
        //通过字符的数量判断如何解析颜色
        switch(color_code_nums.length){
            //五个的是直接用rgb
            case 5:{
                html_color="#"+Number(color_code_nums[2]).toString(16)+Number(color_code_nums[3]).toString(16)+Number(color_code_nums[4]).toString(16)
                break;
            }
            //1个字符这种情况我也不知道是什么意思，就先映射了
            case 1:{
                switch(color_code_nums[0]){
                    case "1":
                    case "31":
                    case "91":html_color="red";break;
                    case "33":
                    case "93":html_color="yellow";break;
                    case "21":html_color="blue";break;
                    case "4":
                    case "37":
                    case "0":html_color="white";break;
                    //默认情况在控制台输出颜色代码，方便后续更新的时候通过用户反馈找规律
                    default:
                        html_color="white";
                        console.warn("未识别的颜色代码："+color_code_nums[0])
                        console.warn("相关的输出内容："+color_slice)
                }
                break;
            }
            default:html_color="white";
        }
        //这个列表只代表当前这一行，这一整个列表用于给后面拼接成html用
        color_slices_html=color_slices_html.concat({
            color:html_color,
            color_code,
            text
        });
    }
    //将所有颜色片段整合为一行
    let line="";
    /**用于储存本行最后一个颜色代码*/
    let line_last_color_code="0";
    for(let color_slice of color_slices_html){
        line=line+`<span style=color:${color_slice.color}>`+color_slice.text+"</span>"
        //如果每执行一次for都覆盖一下这个变量的值，那当for执行完的时候这个变量的值就是最后次执行for时写入的值
        line_last_color_code=color_slice.color_code;
    }
    //此处已经执行到本行最后，所以直接把最后一个代码写入，作为下一行开头使用的颜色代码
    last_line_color_code=line_last_color_code;
    return line;
}