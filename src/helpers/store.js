const electron = require("electron");
const path = require("path");
const fs = require("fs");

//custom store for the application
class Store {
    constructor(){
        this.userDataPath = (electron.app || electron.remote.app).getPath('userData');
    };

    get(key, fileName, getById=false, id=null){
        const fullPath = path.join(this.userDataPath, fileName + '.json');
        const data = parseDataFile(fullPath, {});
        console.log("getter", data);
        let ret = data[key]
        if(getById){ret = ret[id]}
        if(ret === undefined){return null}
        return ret;
    };

    delete(sub_key, key, fileName){
        const fullPath = path.join(this.userDataPath, fileName + '.json');
        const data = parseDataFile(fullPath, {});
        console.log(data);
        console.log(sub_key, key);
        delete data[key][sub_key];
        console.log("after delete", data);
        fs.writeFileSync(fullPath, JSON.stringify(data))
        return true;
    }

    set(key, fileName, obj, setById=false, id=null){
        const fullPath = path.join(this.userDataPath, fileName + '.json');
        console.log("setting", key, obj);
        let data = parseDataFile(fullPath, {})
            if(setById){data[key][id] = obj;}
            else{data[key] = obj;}
        console.log("data after setting new value: ", data);
        
        fs.writeFileSync(fullPath, JSON.stringify(data))
    };
}

function parseDataFile(filePath, defaults){
    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
        return defaults;
    };
}

module.exports = Store;