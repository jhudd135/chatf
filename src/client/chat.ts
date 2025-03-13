import { refDir } from "./hrefs.ts";
import { Socket } from "socket.io";
import { UserConfig } from "./login.ts";

export type Message = {content: string, name: string, time: number};

let config: UserConfig;
let socket: Socket;

let messageInput: HTMLTextAreaElement;
let messageDiv: HTMLDivElement;
let errorSpan: HTMLSpanElement;
let connectedUsersDiv: HTMLDivElement;
let connectedUserCountSpan: HTMLSpanElement;
let muteButton: HTMLButtonElement;
let refreshButton: HTMLButtonElement;

let ding: HTMLAudioElement = new Audio("./resources/ding.mp3");

let muted = false;

export function init(io: (...args: any) => Socket) {
    messageInput = document.getElementById("messageInput") as HTMLTextAreaElement;
    messageDiv = document.getElementById("messageDiv") as HTMLDivElement;
    errorSpan = document.getElementById("errorSpan");
    connectedUsersDiv = document.getElementById("connectedUsersDiv") as HTMLDivElement;
    connectedUserCountSpan = document.getElementById("connectedUserCountSpan");
    muteButton = document.getElementById("muteButton") as HTMLButtonElement;
    refreshButton = document.getElementById("refreshButton") as HTMLButtonElement;

    config = JSON.parse(sessionStorage.getItem("userConfig"));
    if (!config) {
        errorSpan.innerText = "missing user config";
        goToLogin();
    }
    document.getElementById("userInfoSpan").innerText = config.name + ":" + config.token;
    document.getElementById("roomHeader").innerText = config.room;

    
    socket = io({auth: config});    
    
    socket.on("disconnect", () => {
        errorSpan.innerText = "connection failed";
        goToLogin();
    });

    document.getElementById("sendMessageButton").onclick = sendMessage;
    
    messageInput.addEventListener("keydown", ev => {
        if (ev.key === "Enter" && !ev.getModifierState("Shift")) {
            sendMessage();
            ev.preventDefault();
        }
    });

    socket.on("message", msg => {
        const message = msg as Message;
        messageDiv.appendChild(buildMessage(message));
        scrollToLatest();
        if (!muted && message.name !== config.name) {
            ding.play();
        }
    });

    socket.on("statusUpdate", (update: {name: string, connected: boolean}) => {
        const domId = "user-" + update.name;
        const old = document.getElementById(domId)
        if (old) {
            connectedUsersDiv.removeChild(old);
        }
        if (update.connected) {
            connectedUsersDiv.appendChild(buildUserSpan(update.name));
        }
        connectedUserCountSpan.innerText = "" + connectedUsersDiv.childNodes.length;
    });

    document.getElementById("leaveButton").onclick = leave;

    muteButton.onclick = (ev) => {
        muted = !muted;
        muteButton.innerText = muted ? "unmute" : "mute";
    }

    refreshButton.onclick = refresh;

    refresh();
}

function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) { return; }
    const message: {token: string, message: Message} = {token: config.token, message: {content: content, name: config.name, time: Date.now()}};
    socket.emit("message", message);
    messageInput.value = "";
    messageInput.focus();
};

function buildMessage(message: Message): HTMLDivElement {
    const div = document.createElement("div");
    div.classList.add("msg");
    const name = document.createElement("span");
    name.innerText = message.name;
    div.appendChild(name);
    const time = document.createElement("span");
    time.innerText = new Date(message.time).toLocaleString("en-US");
    time.classList.add("msgTime");
    div.appendChild(time);
    const content = document.createElement("p");
    content.innerText = message.content;
    div.appendChild(content);
    return div;
}

function goToLogin() {
    window.location.assign(refDir(window.location.href) + "login.html");
}

function leave() {
    fetch(refDir(window.location.href) + "api/leave", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(config)
    }).then(response => {
        if (response.ok) {
            sessionStorage.removeItem("userConfig");
            goToLogin();
        } else {
            response.text().then(err => {
                errorSpan.innerText = err;
            });
        }
    });
}

function scrollToLatest() {
    messageDiv.scrollTop = messageDiv.scrollHeight;
}

function refresh() {
    socket.timeout(5000).emitWithAck("refresh").then((response: {names: string[], messages: Message[]}) => {
        messageDiv.innerText = "";
        response.messages.forEach(message => {
            messageDiv.appendChild(buildMessage(message));
        });
        scrollToLatest();
        connectedUsersDiv.innerText = "";
        response.names.forEach(name => {
            connectedUsersDiv.appendChild(buildUserSpan(name));
        });
        connectedUserCountSpan.innerText = "" + connectedUsersDiv.childNodes.length;
    });
}

function buildUserSpan(name: string) {
    const span = document.createElement("span");
    span.innerText = name;
    span.classList.add("user");
    span.id = "user-" + name;
    return span;
}