import { Utils } from "./utils.js";

const axios = window.axios;
const db = localStorage;
const moment = window.moment;

const LOGIN_SESSION = "login_session";

async function serverLogin(serverName = "") {
    const loginUrl = `https://flixema.com/api/v1/login?login=${serverName}&password=@${serverName}`;
    const CREATED_SESSION_DATE = moment().format('YYYY-MM-DD HH:mm:ss');
    const session = db.getItem(LOGIN_SESSION);
    if (session != null) {
        const map = JSON.parse(session);
        const isExpired = Utils.checkExpireToken(map["expire_in"]);
        if (isExpired) {
            const response = await axios.post(loginUrl);
            if (response.status == 200) {
                console.log("Session expired and created new in this browser.");
                const mm = response.data;
                const ss = {
                    "token": mm["token"],
                    "expire_in": `${CREATED_SESSION_DATE}`,
                };
                db.setItem(LOGIN_SESSION, JSON.stringify(ss));
                return ss['token'];
            } else {
                return null;
            }
        } else {
            console.log("Using created session in this browser.");
            return map["token"];
        }
    } else {
        const response = await axios.post(loginUrl);
        if (response.status == 200) {
            console.log("Session created in this browser.");
            const mm = response.data;
            const ss = {
                "token": mm["token"],
                "expire_in": `${CREATED_SESSION_DATE}`,
            };
            db.setItem(LOGIN_SESSION, JSON.stringify(ss));
            return ss['token'];
        } else {
            return null;
        }
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