import { Utils } from "./utils.js";
import { Method } from "./method.js";

let DATA;

document.getElementById("install-btn").onclick = Utils.installNow;
document.getElementById("nav-logo").onclick = () => {
    window.open('./', '_self');
};

const bodyContainer = document.getElementById("body-container");
const bgPage = document.getElementById("bg-page");
const loadingBar = document.getElementById("loading");
const errorStatus = document.getElementById("error");

window.addEventListener("scroll", function () {
    const navbar = document.querySelector("nav");
    navbar.classList.toggle("sticky", window.scrollY > 1);
});

const titlePage = document.getElementById("title-movie");
const youtubeFrame = document.getElementById("yt-player");
const postImage = document.getElementById("poster-img");
const posterTitle = document.getElementById("poster-title");
const headerInfoText = document.getElementById("header-info-text");
const headerInfoText1 = document.getElementById("header-info-text1");
const storyInfoText = document.getElementById("story-info-text");

const ymlOPtion = document.getElementById("yml-option");
const trdOption = document.getElementById("trd-option");
const relatedList = document.getElementById("related-list");

const queryUrl = new URLSearchParams(document.location.search);
const type = queryUrl.get("t");
const postId = queryUrl.get("i");
const fromClient = queryUrl.get("f");

if (type == null || type == "") {
    errorStatus.style.display = "flex";
    loadingBar.style.display = "none";
} else if (postId == null || postId == "") {
    errorStatus.style.display = "flex";
    loadingBar.style.display = "none";
} else if (fromClient == null || fromClient == "") {
    errorStatus.style.display = "flex";
    loadingBar.style.display = "none";
} else {
    errorStatus.style.display = "none";
    loadingBar.style.display = "flex";
    initialize();
}

function initialize() {
    const client = Utils.decodeClientToServerName(fromClient);
    if (client == "invalid") {
        errorStatus.style.display = "flex";
        loadingBar.style.display = "none";
    } else {
        Method.serverLogin(client).then((token) => {
            if (token != null) {
                Method.requestMovie(token, type, postId).then((result) => {
                    if (result != null) {
                        DATA = result;
                        document.getElementById("bg-img").src = result['banner'];
                        titlePage.innerText = `MerlMovie | ${result["post_title"]}`;
                        youtubeFrame.src = Utils.getYoutubeEmbed(result["trailer"]) + "?autoplay=1";
                        postImage.src = result['thumbnail'];
                        posterTitle.innerText = result["post_title"];
                        const [p, s] = result["released"].split("(");
                        if (type == "anime") {
                            headerInfoText.innerText = `Score: ${result["rating"]} | ${p}`;
                        } else {
                            headerInfoText.innerText = `Rate: ${result["rating"]}/10 | ${p}`;
                        }
                        headerInfoText1.innerText = `Runtime: ${result["runtime"] != null ? result["runtime"] : "N/A"} | ${result["year"].substring(0, 4)} | ${result["language"]}`;
                        storyInfoText.innerText = result["story"];

                        createRelatedList(result["related_posts"]);
                        loadingBar.style.display = "none";
                        bodyContainer.style.display = "inline-block";
                        bgPage.style.display = "block";
                    } else {
                        errorStatus.style.display = "flex";
                        loadingBar.style.display = "none";
                    }
                });
            } else {
                errorStatus.style.display = "flex";
                loadingBar.style.display = "none";
            }
        });
    }
}

ymlOPtion.onclick = () => {
    relatedList.innerHTML = "";
    relatedList.style.display = "none";
    ymlOPtion.style.backgroundColor = "red";
    trdOption.style.backgroundColor = "#303030";
    createRelatedList(DATA["related_posts"]);
    relatedList.style.display = "block";
}

trdOption.onclick = () => {
    relatedList.innerHTML = "";
    relatedList.style.display = "none";
    ymlOPtion.style.backgroundColor = "#303030";
    trdOption.style.backgroundColor = "red";
    createRelatedList(DATA["tranding_posts"]);
    relatedList.style.display = "block";
}

const timer = ms => new Promise(res => setTimeout(res, ms));

async function createRelatedList(items = []) {
    relatedList.style.display = 'block';
    for (var i = 0; i < items.length; i++) {
        createRelatedItem(items[i]);
        await timer(50);
    }
}

function createRelatedItem(map = {}) {
    const item = document.createElement("a");
    const itemType = getType(map['link']);
    const [p, s] = map["released"].split("(");
    item.href = `./view?t=${itemType}&i=${map["post_id"]}&f=${fromClient}`;
    item.innerHTML += `<div id="related-item">
        <img id="related-poster-img" src="${map["thumbnail"]}" alt="">
        <div id="related-title-info">
           <p id="related-title">${map["post_title"]}</p>
            <p id="related-subtitle">${p}</p>
        </div>
        </div>`;
    relatedList.appendChild(item);

}

function getType(l = '') {
    const [prefix, suffix] = l.split("v1/");
    const [a, b] = suffix.split("/");
    return a;
}