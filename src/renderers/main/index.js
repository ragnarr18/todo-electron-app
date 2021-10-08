const createToDoButn = document.getElementById('createToDoButn');
const exitKeys = ['Escape']
const activeKeys = ['Enter']
const deleteKeys = ['Delete']
const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
let currentItemIndex = 0;

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

function createSingleElement(type=null, className=null, key=null, tabIndex=null){
    const item = document.createElement(type);
    item.className = className;
    item.key = key;
    item.tabIndex = tabIndex;
    return item;
}


async function createItem(key, value, active, parent){
    const item = createSingleElement(type="div", className=`item-${key}`, id=key, key=key, active=active, tabIndex=0);
    item.id = key;
    item.active = active;
    
    const textDiv = createSingleElement(type= "div", className= `text-${key}`, key=key, tabIndex=-1)
    textDiv.spellcheck = false;
    textDiv.contentEditable = true
    const newContent = document.createTextNode(value)
    textDiv.appendChild(newContent)
    
    const buttonDiv = createSingleElement(type="div", className=`finish-${key}`, key=key, tabIndex=-1)
    const button = createSingleElement(type="button", tabIndex=-1)
    buttonDiv.appendChild(button);
    
    const deleteButton = createSingleElement(type="div", className=`close-${key}`, key=key, tabIndex=-1)
    const textNode = document.createTextNode("\u00D7")
    deleteButton.appendChild(textNode);

    textDiv.onkeydown = (e) => {
        e.stopPropagation();
        if (exitKeys.includes(e.key) ){
            textDiv.blur();
        }
    }
    textDiv.onfocus = (e) => {
        window.getSelection().selectAllChildren(textDiv)
        window.getSelection().collapseToEnd()
    }

    textDiv.oninput = async(e) => {
        await window.api.setText({key: key, text: textDiv.textContent})
    }
    if(item.active){ 
        await finishTodo(button);
        await finishTodo(textDiv)
    } 
    buttonDiv.onclick = async() => {
        await finishTodo(button) 
        await finishTodo(textDiv)
        item.active = !item.active
        await window.api.setActive({key: key, active: item.active})
    }
    deleteButton.onclick = async(e) => await deleteTodo(e, key);
    item.onfocus = async(e) => {
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
            else if(arrowKeys.includes(e.key)){
                return;
            }
            else if(exitKeys.includes(e.key)){
                item.blur();
                document.getElementById("inputField").focus();
            }
            else{
                textDiv.focus();
                return; 
            }
        }
    }
    item.appendChild(buttonDiv)
    item.appendChild(textDiv)
    item.appendChild(deleteButton)
    parent.appendChild(item)
    return;
}

function finishTodo(obj){
    if(obj.classList.contains("success")){
        obj.classList.remove("success")
    }
    else {
        obj.classList.add("success")
    }
}

window.api.initTodos().then(async (data) =>{
        const parent = document.createElement("div");
        parent.className = "list";
        parent.id = "list";
        await document.body.appendChild(parent);
        for (key in data){
            await createItem(key, data[key].value, data[key].active, parent)
        }
        changeLayout();
    })

//navigation
document.onkeydown = (e) => {
    if(arrowKeys.includes(e.key) ){
        const inputContainer = document.getElementById("inputField");
        let items = document.querySelectorAll("[class*=item]"); //get all elements that contain "item" in className
        let index = 0;
        items = [inputContainer, ...items];
        for (let i = 0; i < items.length; i++) {
            if(document.activeElement === items[i]){
                console.log("is active", items[i]);
                items[i].blur();
                index = i;
                break;
            }
            
        }
        if(items.length > 0){
            switch(e.key){
                case arrowKeys[0]: //up
                    if(index > 0){
                        items[index -1].focus();
                        break;
                    }
                    items[index].focus();
                    break;
                case arrowKeys[1]: //down
                    if(index < items.length -1){
                        items[index +1].focus()
                        break;
                    }
                    items[index].focus();
                    break; 
                // case e.key === arrowKeys[2]: //left
                // case e.key === arrowKeys[3]: //right
            }
        }
    }
}