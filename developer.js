function show_developer_panel(){
    document.getElementById("developer_panel").style.display="block"
}
function close_developer_panel(){
    document.getElementById("developer_panel").style.display="none"
}
function manuallyCleanAllConf(){
    resetConf();
    location.reload();
}