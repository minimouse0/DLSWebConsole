let zIndex=9000;
function notify(type,msg,time=5000){
    //判断当前是否由父页面加载
    if(window.self !== window.top){
        nortificationToTop(type,msg)
        return;
    }
    // 创建悬浮窗元素
    const banner = document.createElement('div');
    banner.id = 'top-banner';
    banner.textContent = msg;

    // 设置样式
    let bgColor = '#f9f9f9';
    let textColor = '#333';
    
    switch(type) {
        case 'info':
            bgColor = 'rgba(230, 247, 255, 0.8)';   // 淡蓝玻璃
            textColor = '#0050b3';
            break;
        case 'warn':
            bgColor = 'rgba(255, 251, 230, 0.8)';
            textColor = '#d48806';
            break;
        case 'error':
            bgColor = 'rgba(255, 241, 240, 0.8)';
            textColor = '#a8071a';
            break;
    }
    
    banner.style.position = 'fixed';
    banner.style.top = '22px';
    banner.style.left = '40%';
    banner.style.display = 'inline-block'; // 让宽度由内容决定
    banner.style.backdropFilter = 'blur(10px)';
    banner.style.backgroundColor = bgColor;
    banner.style.color = textColor;
    banner.style.whiteSpace = 'normal';    // 允许换行
    banner.style.textAlign = 'left';       // 文字左对齐
    banner.style.padding = '16px 24px';    // 给内容留点空间
    banner.style.maxWidth = '80vw';        // 防止太宽撑满屏幕
    banner.style.boxSizing = 'border-box'; // 让 padding 不影响布局
    banner.style.fontSize = '18px';
    banner.style.borderBottom = '1px solid #ccc';
    banner.style.borderRadius = '8px';
    banner.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    banner.style.zIndex = zIndex.toString();
    if(zIndex<9999)zIndex++;
    else zIndex=9000;
    banner.style.transform = 'translateY(-170%)'; // 初始在页面上方

    // 添加淡入动画
    banner.style.transition = 'transform 0.7s cubic-bezier(.36,.99,.64,1.02)';
    //https://cubic-bezier.com/


    setTimeout(() => {banner.style.transform = 'translateY(0)';}, 10); // 10ms 是为了确保 DOM 渲染完成

    // 插入到页面顶部
    document.body.prepend(banner);


    
    
    // 5秒后
    setTimeout(() => {
        //淡出动画
        banner.style.transition = 'transform 0.5s cubic-bezier(.2,0,.48,.17)';
        banner.style.transform = 'translateY(-170%)'; // 向上滑出
        setTimeout(() => {
            banner.remove();
          }, 1000); //清除
          
    }, time); // 显示时间
    
}

function nortificationToTop(type,msg){
    window.parent.postMessage({type:"notify",data:{type,msg}},'*')
}

window.addEventListener('message', e=>{
    if(e.data.type==="notify"){
        //如果自己不是父页面，那么直接不处理
        if(window.self !== window.top)return;
        notify(e.data.data.type,e.data.data.msg);
    }
})