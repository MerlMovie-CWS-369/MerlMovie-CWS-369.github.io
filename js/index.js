import { Utils } from "./utils.js";

const privacybtn = document.getElementById("pr-pl-btn");
const installnow = document.getElementById("install-now-btn");

privacybtn.onclick = () => {
    window.open("./privacy-policy");
}

installnow.onclick = () => Utils.installNow();

