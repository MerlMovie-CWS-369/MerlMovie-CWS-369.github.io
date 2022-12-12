import { Utils } from "./utils.js";

const axios = window.axios;
const db = localStorage;
const moment = window.moment;

const LOGIN_SESSION = "login_session";

async function serverLogin(serverName = "") {
    const session = db.getItem(LOGIN_SESSION);
    if (session != null) {
        const map = JSON.parse(session);
        const isExpired = Utils.checkExpireToken(map["expire_in"]);
        if (serverName == map["server_name"]) {
            if (isExpired) {
                const token = await logintoserver(serverName);
                if (token != null) {
                    console.log("Session expired and created new in this browser.");
                }
                return token;
            } else {
                console.log("Using created session in this browser.");
                return map["token"];
            }
        } else {
            const token = await logintoserver(serverName);
            if (token != null) {
                console.log("Created and replaced new session requested from another client.");
            }
            return token;
        }
    } else {
        const token = await logintoserver(serverName);
        if (token != null) {
            console.log("Session created in this browser.");
        }
        return token;
    }
}

async function logintoserver(client = '') {
    const loginUrl = `https://flixema.com/api/v1/login?login=${client}&password=@${client}`;
    const CREATED_SESSION_DATE = moment().format('YYYY-MM-DD HH:mm:ss');
    const response = await axios.post(loginUrl);
    if (response.status == 200) {
        const mm = response.data;
        const ss = {
            "server_name": client,
            "token": mm["token"],
            "expire_in": `${CREATED_SESSION_DATE}`,
        };
        db.setItem(LOGIN_SESSION, JSON.stringify(ss));
        return ss['token'];
    } else {
        console.log("Error invalid client request.");
        return null;
    }
}

async function requestMovie(token = "", type = "", postId = "") {
    const requestUrl = `https://flixema.com/api/v1/${type}/${postId}`;
    const config = {
        "headers": {
            "Content-type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    };
    const response = await axios.get(requestUrl, config);
    if (response.status == 200) {
        return response.data;
    } else {
        return null;
    }

}

const Method = {
    serverLogin,
    requestMovie,
}

export {
    Method,
}