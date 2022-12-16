const alphabetsToNumbers = {
    "a": "0",
    "b": "1",
    "c": "2",
    "d": "3",
    "e": "4",
    "f": "5",
    "g": "6",
    "h": "7",
    "i": "8",
    "j": "9",
};

function installforplatform() {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator?.userAgentData?.platform || window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
        return "macOS";
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        return "iOS";
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        return "windows";
    } else if (/Android/.test(userAgent)) {
        return "android";
    } else if (/Linux/.test(platform)) {
        return "linux";
    }

    return os;
}

function checkExpireToken(date = '') {
    const ago = timeAgo(date);
    const val = justNumbers(`${ago}`);
    const suffix = `${ago}`.replace(`${val} `, '');

    if (suffix == "second ago" || suffix == "seconds ago") {
        return false;
    } else if (suffix == "minute ago" || suffix == "minutes ago") {
        return false;
    } else if (suffix == "hour ago" || suffix == "hours ago") {
        return false;
    } else if (suffix == "day ago" || suffix == "days ago") {
        if (val >= 6) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }

}

function timeAgo(input) {
    const date = (input instanceof Date) ? input : new Date(input);
    const formatter = new Intl.RelativeTimeFormat('en');
    const ranges = {
        years: 3600 * 24 * 365,
        months: 3600 * 24 * 30,
        weeks: 3600 * 24 * 7,
        days: 3600 * 24,
        hours: 3600,
        minutes: 60,
        seconds: 1
    };
    const secondsElapsed = (date.getTime() - Date.now()) / 1000;
    for (let key in ranges) {
        if (ranges[key] < Math.abs(secondsElapsed)) {
            const delta = secondsElapsed / ranges[key];
            return formatter.format(Math.round(delta), key);
        }
    }
}

function justNumbers(string) {
    var numsStr = string.replace(/[^0-9]/g, '');
    return parseInt(numsStr);
}

function getYoutubeEmbed(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);

    if (match && match[2].length == 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    } else {
        return 'error';
    }
};

function decodeClientToServerName(client = "") {
    var temp = "";
    const [prefix, suffix] = client.split("-");
    temp += prefix.replace(prefix[0], prefix[0].toUpperCase());
    for (var i = 0; i < suffix.length; i++) {
        if (alphabetsToNumbers[suffix[i]] != undefined) {
            temp += alphabetsToNumbers[suffix[i]];
        } else {
            temp = "invalid";
            break;
        }
    }
    return temp;
}

const Utils = {
    installforplatform,
    decodeClientToServerName,
    getYoutubeEmbed,
    checkExpireToken,
    justNumbers,
    timeAgo,
}

export {
    Utils,
}