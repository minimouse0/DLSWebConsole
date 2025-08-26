
// 定义ANSI颜色和样式的映射
const ansiColors = {
    '0': 'color:inherit;font-weight:inherit;', // 重置所有样式
    '1': 'font-weight:bold;', // 粗体
    '30': 'color:black;',
    '31': 'color:red;',
    '32': 'color:green;',
    '33': 'color:yellow;',
    '34': 'color:blue;',
    '35': 'color:magenta;',
    '36': 'color:cyan;',
    '37': 'color:white;',
    '90': 'color:#808080;', // 亮黑色 (灰色)
    '91': 'color:lightcoral;',
    '92': 'color:lightgreen;',
    '93': 'color:khaki;',
    '94': 'color:lightskyblue;',
    '95': 'color:violet;',
    '96': 'color:paleturquoise;', // 亮青色
    '97': 'color:white;' // 亮白色
};
/**
 * 将dls发出的带颜色的一整行输出转换为html格式
 */
function color_html_convert(log){// ANSI转义序列的正则表达式
    let {color_text}=log;

    const ansiRegExp=/\u001b\[\??(?:\d+;)*\d+[a-zA-Z]/

    let result=""

    //使用一个结构为彩色字符分组
    const patternPairs=[]
    //创建第一个配对
    patternPairs.push({sequences:[],log:""})
    //开始循环查找
    //首先判断开头是不是一个ansi序列
    let accumulated=0;
    while(color_text.length!=0&&accumulated<999){
        let pattern=""
        if (color_text.charAt(0) === "\u001b") {
            //是ansi序列，直接识别这个序列是什么
            pattern=getFirstAnsiSequence(ansiRegExp,color_text)
            //将自己加入目前的最后一个配对
            patternPairs[patternPairs.length-1].sequences.push(pattern)
        }
        else{
            //不是ansi序列，查找到下一个ansi序列前的字符串片段
            pattern=getPrefixBeforeFirstAnsi(ansiRegExp,color_text)
            //既然已经找到了一个log，那么就收尾上个配对，并创建新的配对
            patternPairs[patternPairs.length-1].log=pattern
            patternPairs.push({sequences:[],log:""})
        }
        result+=pattern;
        color_text=color_text.replace(pattern,"")
        accumulated++;
    }
    let htmlCode=""
    for(const pair of patternPairs){
        htmlCode+="<span style="
        for(const ansiSequence of pair.sequences){
            //跳过ansi的控制光标
            if(!ansiSequence.endsWith("m"))continue;
            //提取颜色
            const colorCodesMatch=ansiSequence.match(/(?<=\u001b\[)[0-9;]+(?=m)/g)
            const colorCodes=(colorCodesMatch[0]!=null?colorCodesMatch[0].split(";"):0)
            // console.log(JSON.stringify(colorCodes,undefined,4))
            //取最后一个颜色作为有效值
            const availableColorCode=colorCodes[colorCodes.length-1];
            // console.log(colorCodes)
            htmlCode+=ansiColors[availableColorCode]!==undefined?ansiColors[availableColorCode]:""
        }
        // console.log("log:"+pair.log)
        htmlCode+=">"+pair.log+"</span>";
    }
    // console.log(htmlCode)
    return htmlCode//+"<br>"+log.text
}

function getFirstAnsiSequence(ansiRegex,str) {
    
    // 执行匹配
    const match = str.match(ansiRegex);
    
    // 由于确认开头一定是ANSI序列，所以直接返回匹配结果
    return match ? match[0] : null;
}

function getPrefixBeforeFirstAnsi(ansiRegex,str) {
    // 1. 先判断字符串开头是否为 ANSI 序列的起始字符 \u001b
    if (str.length === 0) return ""; // 处理空字符串边界情况
    if (str.charAt(0) === "\u001b") {
        // 开头就是 ANSI 序列，无「开头到第一个 ANSI 前」的字符串
        return "";
    }
    // 找到第一个 ANSI 序列的匹配结果
    const match = str.match(ansiRegex);

    if (match) {
        // 提取「开头到第一个 ANSI 序列起始位置前」的字符串
        return str.substring(0, match.index);
    } else {
        return str;
    }
}

//deprecated

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