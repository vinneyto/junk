const  button = document.getElementById('but');
function onClick (){
    console.log("вы нажали на кнопку")
}
if(button===null){
    alert('кнопка не найдена на стрнице');
}
button.addEventListener("click", onClick)

