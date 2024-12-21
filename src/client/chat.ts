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

export function init(io: (...args: any) => Socket) {
    config = JSON.parse(localStorage.getItem("userConfig"));
    document.getElementById("userInfoSpan").innerText = config.name + ":" + config.token;
    document.getElementById("roomHeader").innerText = config.room;

    messageInput = document.getElementById("messageInput") as HTMLTextAreaElement;
    messageDiv = document.getElementById("messageDiv") as HTMLDivElement;
    errorSpan = document.getElementById("errorSpan");
    connectedUsersDiv = document.getElementById("connectedUsersDiv") as HTMLDivElement;
    connectedUserCountSpan = document.getElementById("connectedUserCountSpan");

    socket = io({auth: config});

    document.getElementById("sendMessageButton").onclick = sendMessage;
    
    messageInput.addEventListener("keydown", ev => {
        if (ev.key === "Enter" && !ev.getModifierState("Shift")) {
            sendMessage();
            ev.preventDefault();
        }
    });

    socket.on("message", msg => {
        messageDiv.appendChild(buildMessage(msg as Message));
        scrollToLatest();
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

function leave() {
    fetch(refDir(window.location.href) + "api/leave", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(config)
    }).then(response => {
        if (response.ok) {
            localStorage.removeItem("userConfig");
            window.location.assign(refDir(window.location.href) + "login.html");
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