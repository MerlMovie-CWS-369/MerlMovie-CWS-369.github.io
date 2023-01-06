import { Utils } from "./services/utils.js";
import { Method } from "./services/method.js";
import { Config } from "./firebase/config.js";
import { FirebaseApp } from "./firebase/firebase-app.js";
import { FirebaseAuth } from "./firebase/firebase-auth.js";
import { Call, FirebaseFirestore } from "./firebase/firebase-firestore.js";

const timer = ms => new Promise(res => setTimeout(res, ms));

let app;
let DATA;
let CLIENT;
let DEVICEID;
let platformname;

var canReward = false;

const installbtn = document.getElementById("install-btn");
installforplatformname();
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
    if (canReward) {
        if (CLIENT['premium'] == false) {
            giftRewardToClient();
        };
    }
};

function installforplatformname() {
    var plat = Utils.installforplatform();
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
const ytBanner = document.getElementById("yt-banner");
const youtubeFrame = document.getElementById("yt-player");
const postImage = document.getElementById("poster-img");
const posterTitle = document.getElementById("poster-title");
const headerInfoText = document.getElementById("header-info-text");
const headerInfoText1 = document.getElementById("header-info-text1");
const storyInfoText = document.getElementById("story-info-text");
const castBtn = document.getElementById('cast-btn');
const triggerInput = document.getElementById('trigger');
const castList = document.getElementById("cast-list");

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
    document.getElementById('watch-now-btn').onclick = () => {
        window.open(`open://merlmovie/view?t=${type}&i=${postId}&f=${fromClient}`, '_self');
    };
    initialize();
}

if (fromClient == null || fromClient == "") {
    openapp();
}

async function openapp() {
    await timer(800);
    if (type != null && postId != null) {
        window.open(`open://merlmovie/view?t=${type}&i=${postId}`, '_self');
    }
}

function initialize() {
    const client = Utils.decodeClientToServerName(fromClient);
    if (client == "invalid") {
        errorStatus.style.display = "flex";
        loadingBar.style.display = "none";
    } else {
        app = FirebaseApp.initializeApp(Config.FirebaseConfiguration);
        const auth = FirebaseAuth.getAuth(app);
        FirebaseAuth.onAuthStateChanged(auth, async (user) => {
            if (user != null) {
                canReward = await checkcanrewardcoins(app, client);
                if (canReward) {
                    installbtn.style.backgroundColor = "#e50915";
                }
                checkAndRequestMovieForClient(client);
            } else {
                const email = `${client.toLowerCase()}@merl.cloud`;
                const password = `@${client}`
                FirebaseAuth.signInWithEmailAndPassword(auth, email, password).then(async (signInResult) => {
                    canReward = await checkcanrewardcoins(app, client);
                    if (canReward) {
                        installbtn.style.backgroundColor = "#e50915";
                    }
                    checkAndRequestMovieForClient(client);
                }).catch((e) => {
                    if (e.code == "auth/user-not-found") {
                        FirebaseAuth.createUserWithEmailAndPassword(auth, email, password).then(async (createResult) => {
                            canReward = await checkcanrewardcoins(app, client);
                            if (canReward) {
                                installbtn.style.backgroundColor = "#e50915";
                            }
                            checkAndRequestMovieForClient(client);
                        }).catch((x) => {
                            alert("Error something went wrong!");
                        });
                    } else {
                        alert('Server error please try again!');
                    }
                });
            }
        });
    }
}

async function checkcanrewardcoins(app, client) {
    const deviceId = await getDeviceId();
    if (deviceId != null) {
        const db = FirebaseFirestore.getFirestore(app);
        const res = await Call.getSingleDoc(db, "app", "can_earn_coins");
        if (res["can_earn"] == true) {
            const col1 = FirebaseFirestore.collection(db, "users");
            const res1 = await Call.getDocWhere(col1, "server_name", "==", client);
            if (res1 != null) {
                CLIENT = res1;
                if (res1['premium'] == false) {
                    const col2 = FirebaseFirestore.collection(db, `users/${CLIENT['id']}/rewardeds_from/`);
                    const res2 = await Call.getDocWhere(col2, "from_id", "==", deviceId);
                    if (res2 == null) {
                        DEVICEID = deviceId;
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
}

async function giftRewardToClient() {
    const db = FirebaseFirestore.getFirestore(app);
    const col2 = FirebaseFirestore.collection(db, `users/${CLIENT['id']}/rewardeds_from/`);
    const d = FirebaseFirestore.doc(db, "users", CLIENT["id"]);
    await FirebaseFirestore.addDoc(col2, { "from_id": DEVICEID });
    await FirebaseFirestore.updateDoc(d, { coins: CLIENT["coins"] += 5 });
    canReward = false;
    installbtn.style.backgroundColor = "#424242";
    await Method.pushNotification(CLIENT["id"], `Congratulation ${CLIENT['username']}! 🎉🎈`, "5 coins have been added to your account from a link you shared. Let's watch somethings!");
    return;
}

async function getDeviceId() {
    const DEVICE_ID = "device_id";
    const localid = localStorage.getItem(DEVICE_ID);
    if (localid != null) {
        return localid;
    } else {
        const device = await navigator.mediaDevices.enumerateDevices();
        if (device[2].deviceId != "") {
            const id = device[2].deviceId;
            localStorage.setItem(DEVICE_ID, id);
            return id;
        } else {
            return null;
        }
    }
}

function checkAndRequestMovieForClient(client) {
    Method.serverLogin(client).then((token) => {
        if (token != null) {
            Method.requestMovie(token, type, postId).then((result) => {
                if (result != null) {
                    DATA = result;
                    document.getElementById('meta-url').setAttribute('content', window.location.toString());
                    document.getElementById('meta-type').setAttribute('content', result['type']);
                    document.getElementById('meta-title').setAttribute('content', `Watch ${result['post_title']} | MerlMovie Official Site`);
                    document.getElementById('meta-story').setAttribute('content', result['story']);
                    document.getElementById('meta-image').setAttribute('content', result['banner']);
                    document.getElementById("bg-img").src = result['banner'];
                    titlePage.innerText = `MerlMovie | ${result["post_title"]}`;
                    ytBanner.src = result["banner"];
                    const youtubeEmbed = Utils.getYoutubeEmbed(result["trailer"]);
                    if (youtubeEmbed != "error") {
                        youtubeFrame.src = youtubeEmbed + "?autoplay=1";
                    } else {
                        youtubeFrame.style.display = "none";
                        ytBanner.style.display = "flex";
                    }

                    postImage.src = result['thumbnail'];
                    posterTitle.innerText = result["post_title"];
                    const [p, s] = `${result["released"]}`.split("(");
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
                    if (result["cast_crew"] != [] || result['cast_crew'] != null) {
                        castBtn.style.display = 'block';
                        triggerInput.checked = true;
                        createCastList(result['cast_crew']);
                    }
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

ymlOPtion.onclick = async () => {
    document.body.style.height = "1000vh";
    relatedList.innerHTML = "";
    relatedList.style.display = "none";
    ymlOPtion.style.backgroundColor = "red";
    trdOption.style.backgroundColor = "#303030";
    await createRelatedList(DATA["related_posts"]);
    relatedList.style.display = "block";
    document.body.style.height = "fit-content";
}

trdOption.onclick = async () => {
    document.body.style.height = "1000vh";
    relatedList.innerHTML = "";
    relatedList.style.display = "none";
    ymlOPtion.style.backgroundColor = "#303030";
    trdOption.style.backgroundColor = "red";
    await createRelatedList(DATA["tranding_posts"]);
    relatedList.style.display = "block";
    document.body.style.height = "fit-content";
}

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
    item.href = `./view?t=${itemType}&i=${map["post_id"]}&f=${fromClient}`;
    item.innerHTML += `<div id="related-item">
        <img id="related-poster-img" src="${map["thumbnail"]}" alt="">
        <div id="related-title-info">
           <p id="related-title">${map["post_title"]}</p>
            <p id="related-subtitle">${map["released"]}</p>
        </div>
        </div>`;
    relatedList.appendChild(item);
}

async function createCastList(items = []) {
    for (var i = 0; i < items.length; i++) {
        createCastItem(items[i]);
        await timer(50);
    }
}

function createCastItem(map = {}) {
    const item = document.createElement("div");
    item.id = 'cast-item';
    item.innerHTML += `<img src="${map['cast_picture']}" > <p>${map['cast_name']}</p>`;
    castList.appendChild(item);
}

function getType(l = '') {
    const [prefix, suffix] = l.split("v1/");
    const [a, b] = suffix.split("/");
    return a;
}
