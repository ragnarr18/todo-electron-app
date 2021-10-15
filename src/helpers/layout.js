function changeLayout(){
    let parent = document.getElementById("mainContainer");
    if(parent.childElementCount > 0){
        let lastElement = document.getElementById("mainContainer").lastElementChild;
        let bottomY = lastElement.getBoundingClientRect().bottom;
        return bottomY;
    }
    return 0;
}
module.exports = changeLayout;