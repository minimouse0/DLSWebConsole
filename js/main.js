//网页加载完毕才加载的部分
$(function () {
    //清空网页加载时莫名其妙出现的一堆tab
    console.log("114514");
    document.getElementById('command').value = "";
    //检测return/enter键
    $(document).on('keypress', function (e) {
        //后面要检测ctrl+enter换行
        if (e.which == 13) {
            executeCustomCmd(document.getElementById('command'))
            //清空所有指令输入框中的内容
            setTimeout(() => {
                document.getElementById('command').value = "";
            }, 100)

        }
    });
})