$(()=>{
    return;
    //如果是safari浏览器就把margin-left设置为-5
    if(
        navigator.userAgent.includes("Safari")
        &&navigator.userAgent.includes("Macintosh")
        &&navigator.userAgent.includes("AppleWebKit")
        &&!navigator.userAgent.includes("Chrome")
    ){
        document.querySelectorAll('.round_button_image').forEach(element=>element.style["margin-left"]="-3px");   
        document.querySelectorAll('.round_button').forEach(element=>element.style["margin-button"]="50px"); 
        document.querySelectorAll('.send_button_image').forEach(element=>element.style["margin-left"]="-5px");
    }
})


//copilot
function truncateWithEllipsis(text, container) {
	const style = getComputedStyle(container);
	const maxWidth = container.clientWidth;

	const tester = document.createElement("span");
	tester.style.visibility = "hidden";
	tester.style.position = "absolute";
	tester.style.whiteSpace = "nowrap";
	tester.style.font = style.font;
	document.body.appendChild(tester);

	let result = "";
	for (let i = 0; i < text.length; i++) {
		tester.textContent = result + text[i] + "...";
		if (tester.offsetWidth > maxWidth) break;
		result += text[i];
	}

	document.body.removeChild(tester);
	return result + (result.length < text.length ? "..." : "");
}