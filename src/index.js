const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const Store = require("./helpers/store")
const { v4: uuidv4 } = require("uuid");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}
//TODO make frameless
//TODO add clear all
let mainWindow = null
let childWindow = null;

const store = new Store();

function createChildWindow(position){
  childWindow = new BrowserWindow({
    width: 200,
    height: 200,
    parent: mainWindow,
    modal: true,
    x: position.x,
    y: position.y,
    webPreferences: {
      preload: path.join(__dirname, "preload.js") // use a preload script
    }
  })
  childWindow.on("close", ()=>{
    ipcMain.removeHandler("delete-todo:confirmation")
  })
  childWindow.loadFile(path.join(__dirname, 'renderers/confirmation/confirmation.html'));
} 

const createWindow = () => {
  let todos = store.get('todos', 'todos');
  if(todos === null){store.set('todos', 'todos', {})
    todos = store.get('todos', 'todos');}

  let windowBounds = store.get('windowBounds', 'windowSize')
  if (windowBounds === null) {store.set('windowBounds', 'windowSize', { width: 800, height: 600})
    windowBounds = store.get('windowBounds', 'windowSize')}

  let windowPosition = store.get('windowPosition', 'windowPosition');
  if (windowPosition === null){store.set('windowPosition', 'windowPosition', {x: 1300, y: 100})
    windowPosition = store.get('windowPosition', 'windowPosition');
  }
  if(store.get('fontSize', 'fontSize') === null){store.set('fontSize', 'fontSize', {fontSize: 12})}
  if(store.get('theme', 'theme') === null){store.set('theme', 'theme', {theme: 'light'})}

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: windowBounds.width,
    height: windowBounds.height,
    minHeight: 400,
    minWidth: 400,
    frame: false,
    autoHideMenuBar: true,
    show: false,
    x: windowPosition.x,
    y: windowPosition.y,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js") // use a preload script
    }
  });
  mainWindow.on("ready-to-show", mainWindow.show)
  mainWindow.on('closed', () => {
    app.quit()
  })

  mainWindow.on("focus", () =>{
    mainWindow.webContents.send("focus-input");
    mainWindow.webContents.send("change-layout");
  })

  mainWindow.on('resize', () =>{
    let { width, height} = mainWindow.getBounds();
    store.set('windowBounds', 'windowSize' ,{width, height})
  })

  mainWindow.on("ready-to-show", () =>{
    // mainWindow.webContents.send("set-theme")
    mainWindow.webContents.send("change-layout");
  })

  mainWindow.on("resized", ()=>{
    mainWindow.webContents.send("change-layout");
  })

  mainWindow.on('moved', () => {
    let [x, y] = mainWindow.getPosition()
    store.set( 'windowPosition', 'windowPosition', {x, y})
  })

  // const menu = Menu.buildFromTemplate(menuTemplate);
  // Menu.setApplicationMenu(menu);
  
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

function changeLayout(bottomY){
  let bounds = mainWindow.getBounds(); //{ x: 440, y: 225, width: 100, height: 600 }
  let newHeight = bottomY
  mainWindow.setBounds({height: Math.trunc(newHeight)});
}

ipcMain.handle("init-todos",  (e, arg) =>{
  const result = store.get('todos', 'todos');
  return result;
})

//make these calls be one function in preload (get, set for all values)
ipcMain.handle("set-font-size", (e, arg) => {
  store.set('fontSize', 'fontSize' ,{fontSize: arg.fontSize})
  
})

ipcMain.handle("set-theme", (e, arg) => {
  store.set('theme', 'theme' ,{theme: arg.theme})
  
})

ipcMain.handle("get-theme", () => {
  mainWindow.webContents.send("get-theme", store.get("theme", "theme"))
})

ipcMain.handle("get-font-size", () => {
  mainWindow.webContents.send("get-font-size", store.get("fontSize", "fontSize"))
})

ipcMain.handle("close", () => {
  mainWindow.close()
})

ipcMain.handle("minimize", () => {
  mainWindow.minimize()
})

ipcMain.handle('add-todo', (e, text)=> {
  mainWindow.webContents.send('add-todo', {key: uuidv4(), text: text})
})

ipcMain.handle('set-active', (e, args) => {
  let allTodos = store.get("todos", "todos");
  let currentObject = allTodos[args.key]
  currentObject.active = args.active;
  store.set('todos', 'todos', currentObject, true, args.key);
})

ipcMain.handle('set-text', (e, args) => {
  let allTodos = store.get("todos", "todos");
  let currentObject = allTodos[args.key]
  currentObject.value = args.text;
  store.set('todos', 'todos', currentObject, true, args.key);
})

ipcMain.handle('change-layout', (e, args) => {
  changeLayout(args.bottomY)
})

ipcMain.handle('delete-todo', async(e, args) => {
  createChildWindow(args.position)
  childWindow.show();
  return new Promise((resolve, reject) => {
    ipcMain.handle('delete-todo:confirmation', async(e,secondArgs) => {
      if(secondArgs.deleteTodo === true){
        store.delete(args.key, "todos", "todos");
        resolve(secondArgs.deleteTodo);
        childWindow.close();
      }
      resolve(secondArgs.deleteTodo);
      childWindow.close();
    })
  })
})

ipcMain.handle('store-todo', (e, args)=> {
  let data = store.get('todos', 'todos');
  if (data === null || !data[args.key]){
    data[args.key] = {"value": args.text, "active": false};
    store.set('todos', 'todos', data)
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
try {
  require('electron-reloader')(module)
} catch (_) {}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
