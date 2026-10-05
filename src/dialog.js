const dialog = class {
    constructor(id) {
        this.p = document.getElementsByTagName("body")[0];
        this.window = document.createElement("div");
        this.window.id = id;
        this.window.className = "dialogWindow";
        this.window.style.height;
        this.p.appendChild(this.window);
        this.wStatus = "hidden"
    }
    setSize(width, height) {
        this.window.style.width = width;
        this.window.style.height = height;
    }
    getSize() {
        return {"width":this.window.style.width, "height":this.window.style.height};
    }
    setPos(x, y, t) {
        this.window.style.left = x;
        this.window.style.top = y;
    }
    getPos() {
        return {"x":this.window.style.left, "y":this.window.style.top};
    }
    hidden() {
        this.window.style.display = "none";
        this.wStatus = "hidden";
    }
    show() {
        this.window.style.display = "block";
        this.wStatus = "show";
    }
    setTopBar(){
        this.topBar = new dialogTopBar(this);
        return this.topBar;
    }
}
const dialogTopBar = class {
    constructor(dialog) {
        this.dialog = dialog;
        this.window = dialog.window;
        this.root = document.createElement("div");
        this.root.className = "dialogTopBar";
        dialog.window.appendChild(this.root);
    }
    setTitle(name) {
        this.titleBar = document.createElement("div");
        this.titleBar.className = "dialogTopBarItem";
        this.titleBar.style.width = "100%";
        this.titleBar.style.display = "flex";
        this.titleBar.style.alignItems = "center";
        this.titleBar.textContent = name || "";
        this.root.prepend(this.titleBar);
    }
    setTClose(cmd) {
        this.close = document.createElement("div");
        this.close.className = "dialogTopBarItem";
        if (!cmd){
            cmd = () => {this.dialog.hidden()}
        }
        this.close.addEventListener("click",cmd)
        this.root.prepend(this.close);
    }
}

let a = new dialog("a");
a.setTopBar().setTitle();
a.topBar.setTClose();