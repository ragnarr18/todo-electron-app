window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
  })

const {ipcRenderer, contextBridge} = require('electron')
const API = {
  deleteTodo: async({key, position}) => ipcRenderer.invoke("delete-todo", {key, position}),
  deleteTodoConfirm: async({deleteTodo}) => ipcRenderer.invoke("delete-todo:confirmation", {deleteTodo}),
  storeTodo: async({key, text}) =>  ipcRenderer.invoke("store-todo", {key, text}),
  changeLayout: async({bottomY}) => ipcRenderer.invoke("change-layout", {bottomY}),
  setText: async({key, text}) => ipcRenderer.invoke("set-text", {key, text}),
  setActive: async({key, active}) => ipcRenderer.invoke("set-active", ( {key, active})),
  createTodo: async() => ipcRenderer.invoke("create-todo"),
  initTodos: async() => ipcRenderer.invoke("init-todos"),
  addTodo: async(text) => ipcRenderer.invoke("add-todo", text),
  recieve: (channel, func) => ipcRenderer.on(channel, (e, ...args) => func(e, ...args) ),
}

contextBridge.exposeInMainWorld("api", API)