const createToDoButn = document.getElementById('createToDoButn');
const exitKeys = ['Escape']
document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
    const isDarkMode = await myApi.darkModetoggle()
    document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
  })
  
  document.getElementById('reset-to-system').addEventListener('click', async () => {
    await myApi.darkModeSystem()
    document.getElementById('theme-source').innerHTML = 'System'
  })

window.api.recieve('add-todo', async (event, args)=> {
    const parent = document.getElementsByClassName("list");
    console.log("add-todo render:", parent, args.key, args.text);
    createItem(args.key, args.text, active=false, parent[0] );
    console.log("created");
    await window.api.storeTodo({key: args.key, text: args.text})
})

async function deleteTodo(e, key){
    const result = await window.api.deleteTodo({key: key, position: {x: e.screenX, y: e.screenY}})
    console.log(result);
    if (result === true){
        const item = document.getElementsByClassName(`item-${key}`);
        if(item.length > 0){
            item[0].parentNode.removeChild(item[0]);
        }
    }
}

async function createItem(key, value, active, parent){
    const item = document.createElement("div");
    item.className = `item-${key}`;
    item.active = active;
    const textDiv = document.createElement("div");
    textDiv.key = key
    textDiv.className = "todo-text"
    textDiv.spellcheck = false;
    textDiv.contentEditable = true
    textDiv.onkeydown = (e) => {
        if (exitKeys.includes(e.key) ){
        textDiv.blur();
        }
    }
    textDiv.oninput = async() => {
        console.log("oninput", textDiv.textContent);
        await window.api.setText({key: key, text: textDiv.textContent})
    }
    textDiv.onfocus = () => {
        console.log("focus", textDiv.textContent);
    }
    const newContent = document.createTextNode(value)
    textDiv.appendChild(newContent)
    const finishedButton = document.createElement("button");
    if(item.active){ 
        await finishTodo(finishedButton);
        await finishTodo(textDiv)
    }
    finishedButton.onclick = async() => {
        await finishTodo(finishedButton) 
        await finishTodo(textDiv)
        item.active = !item.active
        await window.api.setActive({key: key, active: item.active})
    }
    const deleteButton = document.createElement("div");
    const textNode = document.createTextNode("\u00D7")
    deleteButton.className = `close-${key}`;
    deleteButton.key = key;
    deleteButton.onclick = (e) => deleteTodo(e, key);
    deleteButton.appendChild(textNode);
    item.appendChild(finishedButton)
    item.appendChild(textDiv)
    item.appendChild(deleteButton)
    console.log(parent);
    parent.appendChild(item)
    console.log(parent);

}

function finishTodo(obj){
    console.log(obj);
    if(obj.classList.contains("success")){
        obj.classList.remove("success")
        console.log("success");
    }
    else {
        obj.classList.add("success")
        console.log("not success");
    }
}

window.api.initTodos().then(async (data) =>{
        console.log("init called");
        const parent = document.createElement("div");
        parent.className = "list";
        for (key in data){
            await createItem(key, data[key].value, data[key].active, parent )
        }
        document.body.appendChild(parent);
    })


createToDoButn.addEventListener("click", async() => {
    const result = await window.api.createTodo()
})