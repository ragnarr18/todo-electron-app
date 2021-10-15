//navbar
const minimize = document.getElementById("minimizeWindow")
const closeWindow = document.getElementById("closeWindow")

const dropwdown = document.getElementById("dropdown")
const dropwdownContent = document.getElementById("dropdownContent")
const styleOne = document.getElementById("darkTheme")
const styleTwo = document.getElementById("lightTheme")
const styleList = [styleOne, styleTwo];

const fontSizeInput = document.getElementById("fontSizeInput")

styleList.forEach(element => {
    let styleString = "";
    if(element === styleOne){styleString = "dark"}
    else if(element === styleTwo){styleString = "light"}
    else{styleString = "other"}
    element.onmouseover = () => {
        document.documentElement.setAttribute("current-theme", document.documentElement.getAttribute("data-theme"))
        document.documentElement.removeAttribute("data-theme");
        document.documentElement.setAttribute("data-theme", styleString);
    }
    element.onmouseout = () => {
        document.documentElement.removeAttribute("data-theme", styleString);
        document.documentElement.setAttribute("data-theme", document.documentElement.getAttribute("current-theme"));
    }
    element.onclick = () => {
        document.documentElement.setAttribute("current-theme", styleString)
        document.documentElement.setAttribute("data-theme", styleString);
        window.api.setTheme({theme: styleString})
    }
});

dropwdown.onmouseover = () => {
    dropwdownContent.style.display = "block"
}

dropwdown.onmouseout = () => {
    dropwdownContent.style.display = "none"
}


fontSizeInput.onchange = (e) => {
    document.documentElement.style.setProperty("--font-size", fontSizeInput.value + "px")
    let bottomY = window.api.getBottomY()
    if(bottomY > 0){
        window.api.changeLayout({bottomY: bottomY + 40});
        window.api.setFontSize({fontSize: fontSizeInput.value})
    }
}

window.onload = (e) => {
    window.api.getFontSize();
    window.api.getTheme();
}

window.api.recieve('get-theme', async(event, args) => {
    console.log("get theme", args);
    document.documentElement.setAttribute("data-theme", args.theme)
})
window.api.recieve('get-font-size', async(event, args) => {
    console.log("get font size renderer", args.fontSize);
    // fontSizeInput.value = args.fontSize;
    fontSizeInput.value = args.fontSize
    document.documentElement.style.setProperty("--font-size", fontSizeInput.value + "px")

})

// dropwdownContent.onmouseout = () => {
//     dropwdownContent.style.display = "none"
// }

minimize.onclick = () => {
    window.api.minimize()
}

closeWindow.onclick = () => {
    window.api.close()
}

//keyboard navigation
    //also put code in regarding the navigation