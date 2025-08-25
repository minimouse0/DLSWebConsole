
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

