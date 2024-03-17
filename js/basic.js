// 基本方法，供所有html文件导入后使用
function parseCookie() {
	cookie_data = {}
	let ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let item = ca[i].trim().split("=");
		if (item.length > 1) {
			cookie_data[item[0]] = item[1];
		}
	}
	return cookie_data;
}