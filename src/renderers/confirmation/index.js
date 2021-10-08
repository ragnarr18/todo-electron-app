document.getElementById("yes").onclick = (e) => clickBtn(e,true);
document.getElementById("no").onclick = (e) => clickBtn(e,false);
// yes.addEventListener("click", click(true));
// no.addEventListener("click", click(false));
function clickBtn(e, value){
    console.log(window);
    console.log(e, value);
    e.preventDefault();
    window.api.deleteTodoConfirm({deleteTodo: value});
}