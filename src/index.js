const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('path');
const Store = require("./helpers/store")
const { v4: uuidv4 } = require("uuid");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}
//TODO make frameless
let mainWindow = null
let childWindow = null;
let addWindow = null

const store = new Store();

function createChildWindow(position){
  childWindow = new BrowserWindow({
    width: 200,
    height: 200,
    parent: mainWindow,
    modal: true,
    x: position.x,
    y: position.y
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
    console.log(windowPosition);
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: windowBounds.width,
    height: windowBounds.height,
    x: windowPosition.x,
    y: windowPosition.y,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js") // use a preload script
    }
  });

  mainWindow.on('closed', () => {
    app.quit()
  })

  mainWindow.on('resize', () =>{
    let { width, height} = mainWindow.getBounds();
    store.set('windowBounds', 'windowSize' ,{width, height})
  })

  mainWindow.on('moved', () => {
    let [x, y] = mainWindow.getPosition()
    store.set( 'windowPosition', 'windowPosition', {x, y})
  })
  
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};


ipcMain.handle("init-todos",  (e, arg) =>{
  console.log("init called: ", arg);
  const result = store.get('todos', 'todos');
  return result;
})

ipcMain.handle("create-todo", (e, arg) => {
  createAddWindow();
  return;
})

ipcMain.handle('add-todo', (e, text)=> {
  console.log("add-todo: main: ", text);
  mainWindow.webContents.send('add-todo', {key: uuidv4(), text: text})
  addWindow.close();
})

ipcMain.handle('set-active', (e, args) => {
  let allTodos = store.get("todos", "todos");
  let currentObject = allTodos[args.key]
  currentObject.active = args.active;
  console.log(currentObject, "after");
  store.set('todos', 'todos', currentObject, true, args.key);
})

ipcMain.handle('set-text', (e, args) => {
  console.log("set-text: ", args);
  let allTodos = store.get("todos", "todos");
  let currentObject = allTodos[args.key]
  currentObject.value = args.text;
  console.log(currentObject, "after");
  store.set('todos', 'todos', currentObject, true, args.key);
})

ipcMain.handle('delete-todo', (e, args) => {
  //promt if user wants to delete todo
  createChildWindow(args.position)
  childWindow.show();
  // dialog.showMessageBox(mainWindow, {title: "oops"})
  const result = store.delete(args.key, "todos", "todos");
  console.log("delete" , args.key, args.position);
  return result;
})

ipcMain.handle('store-todo', (e, args)=> {
  console.log("store-todo",args);
  let data = store.get('todos', 'todos');
  console.log("data", data);
  if (data === null || !data[args.key]){
    data[args.key] = {"value": args.text, "active": false};
    store.set('todos', 'todos', data)
  }
})

ipcMain.handle('dark-mode:toggle', (e, args) => {
  if (nativeTheme.shouldUseDarkColors){
    nativeTheme.themeSource = 'light'
  }
  else{
    nativeTheme.themeSource = 'dark'
  }
  return nativeTheme.shouldUseDarkColors;
})

ipcMain.handle('dark-mode:system', (e, args) => {
  nativeTheme.themeSource = 'system';
  return;
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);


//Add window
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 400,
    height: 600,
    title: 'Add todo',
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js") // use a preload script
    },
  });
  // and load the index.html of the add window.
  addWindow.loadFile(path.join(__dirname, '/renderers/addTodo/addTodoWindow.html'));

  //take away memory
  addWindow.on('close', ()=> {
    addWindow = null;
  })
}

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
// try {
//   require('electron-reloader')(module)
// } catch (_) {}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
