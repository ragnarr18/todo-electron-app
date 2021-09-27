const form = document.querySelector('form');
form.addEventListener('submit', submitForm);
function submitForm(e){
    e.preventDefault();
    const text = document.querySelector('#item').value;
    window.api.addTodo(text);
}