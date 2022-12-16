import { Utils } from "./services/utils.js";

let platformname;

const privacybtn = document.getElementById("pr-pl-btn");
const installbtn = document.getElementById("install-now-btn");

installforplatformname();

privacybtn.onclick = () => {
    window.open("./privacy-policy");
}

installbtn.onclick = () => {
    const iosStore = "https://apps.apple.com/app/id6444127460";
    const androidStore = "https://play.google.com/store/apps/details?id=com.NOUVANNET.merlmovie";
    if (platformname == "android") {
        window.open(androidStore, '_blank');
    } else if (platformname == "iOS") {
        window.open(iosStore, '_blank');
    } else {
        window.open(androidStore, "_blank");
    }
};

function installforplatformname() {
    var plat = Utils.installforplatform();
    console.log(plat);
    if (plat == "android") {
        platformname = plat;
        installbtn.innerText = "Install for Android"
    } else if (plat == "iOS") {
        platformname = plat;
        installbtn.innerText = "Install for iOS";
    } else {
        platformname = "";
        installbtn.innerText = "Install Now";
    }
}