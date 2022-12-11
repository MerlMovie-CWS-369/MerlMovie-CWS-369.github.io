import { Utils } from "./utils.js";
import { Method } from "./method.js";

document.getElementById("install-btn").onclick = Utils.installNow;
document.getElementById("header-logo").onclick = () => {
    window.open('./', '_self');
};

const titlePage = document.getElementById("title-movie");
const youtubeFrame = document.getElementById("yt-player");
const body = document.getElementById("body");

const queryUrl = new URLSearchParams(document.location.search);
const type = queryUrl.get("t");
const postId = queryUrl.get("i");
const fromClient = queryUrl.get("f");

Method.serverLogin(Utils.decodeClientToServerName(fromClient)).then((token) => {
    if (token != null) {
        Method.requestMovie(token, type, postId).then((result) => {
            if (result != null) {
                titlePage.innerText = `MerlMovie | ${result["post_title"]}`;
                youtubeFrame.src = Utils.getYoutubeEmbed(result["trailer"]);
                body.background = result['banner'];
            } else {
                //Error while requesting movie from server.
            }
        });
    } else {
        //Error while logging to server.
    }
});