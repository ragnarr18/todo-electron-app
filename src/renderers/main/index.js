const createToDoButn = document.getElementById('createToDoButn');
const exitKeys = ['Escape']
const activeKeys = ['Enter']
const deleteKeys = ['Delete']

window.api.recieve('add-todo', async (event, args)=> {
    const parent = document.getElementsByClassName("list");
    console.log("add-todo render:", parent, args.key, args.text);
    createItem(args.key, args.text, active=false, parent[0] );
    console.log("created");
    await window.api.storeTodo({key: args.key, text: args.text})
    changeLayout();
})

window.api.recieve('focus-input', async(event, args)=>{
    document.getElementById("inputField").focus();
})

window.api.recieve('change-layout', async(event, args) => {
    changeLayout();
})

function changeLayout(){
    let parent = document.getElementById("list");
    console.log(parent);
    if(parent.childElementCount > 0){
        let lastElement = document.getElementById("list").lastElementChild;
        console.log(lastElement.getBoundingClientRect());
        let bottomY = lastElement.getBoundingClientRect().bottom;
        window.api.changeLayout({bottomY: bottomY + 40});
    }
}

async function deleteTodo(e, key){
    const result = await window.api.deleteTodo({key: key, position: {x: e.screenX, y: e.screenY}})
    console.log(result);
    if (result === true){
        const item = document.getElementsByClassName(`item-${key}`);
        if(item.length > 0){
            item[0].parentNode.removeChild(item[0]);
        }
        changeLayout();
    }
}

async function createItem(key, value, active, parent){
    const item = document.createElement("div");
    item.className = `item-${key}`;
    item.id = key;
    item.active = active;
    item.tabIndex = 0;
    const textDiv = document.createElement("div");
    textDiv.key = key
    textDiv.tabIndex = -1;
    textDiv.className = `text-${key}`
    textDiv.spellcheck = false;
    textDiv.contentEditable = true
    textDiv.onkeydown = (e) => {
        if (exitKeys.includes(e.key) ){
        textDiv.blur();
        }
    }
    textDiv.oninput = async() => {
        await window.api.setText({key: key, text: textDiv.textContent})
    }
    const newContent = document.createTextNode(value)
    textDiv.appendChild(newContent)
    const finishedButton = document.createElement("div");
    finishedButton.className = `finish-${key}`;
    finishedButton.tabIndex = -1;
    const button = document.createElement("button");
    button.tabIndex = -1;
    finishedButton.appendChild(button);
    if(item.active){ 
        await finishTodo(button);
        await finishTodo(textDiv)
    } 
    finishedButton.onclick = async() => {
        await finishTodo(button) 
        await finishTodo(textDiv)
        item.active = !item.active
        await window.api.setActive({key: key, active: item.active})
    }
    const deleteButton = document.createElement("div");
    const textNode = document.createTextNode("\u00D7")
    deleteButton.className = `close-${key}`;
    deleteButton.key = key;
    deleteButton.tabIndex = -1;
    deleteButton.onclick = async(e) => await deleteTodo(e, key);
    deleteButton.appendChild(textNode);
    item.onfocus = async(e) => {
        console.log("focused 2");
        item.onkeydown = async(e) => {
            if(activeKeys.includes(e.key)){
                await finishTodo(button) 
                await finishTodo(textDiv)
                item.active = !item.active
                await window.api.setActive({key: key, active: item.active})
                return;
            }
            else if(deleteKeys.includes(e.key)){
                await deleteTodo(e, key)
                return;
            }
            
        }
    }
    item.appendChild(finishedButton)
    item.appendChild(textDiv)
    item.appendChild(deleteButton)
    parent.appendChild(item)
    return;
}

function finishTodo(obj){
    console.log(obj);
    if(obj.classList.contains("success")){
        obj.classList.remove("success")
    }
    else {
        obj.classList.add("success")
    }
}

window.api.initTodos().then(async (data) =>{
        console.log("init called");
        const parent = document.createElement("div");
        parent.className = "list";
        parent.id = "list";
        await document.body.appendChild(parent);
        for (key in data){
            await createItem(key, data[key].value, data[key].active, parent)
        }
        changeLayout();
    })