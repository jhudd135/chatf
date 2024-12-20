import { refDir } from "./hrefs.ts";
import { Socket } from "socket.io";
import { UserConfig } from "./login.ts";

export type Message = {content: string, name: string, time: number};

export function init(io: (...args: any) => Socket) {
    const config: UserConfig = JSON.parse(localStorage.getItem("userConfig"));
    document.getElementById("userInfoSpan").innerText = config.name + ":" + config.token;
    document.getElementById("roomHeader").innerText = config.room;

    const messageInput = document.getElementById("messageInput") as HTMLButtonElement;
    const messageDiv = document.getElementById("messageDiv");
    const removeErrorSpan = document.getElementById("removeErrorSpan");

    const socket = io({auth: config});

    const sendMessage = () => {
        const content = messageInput.value.trim();
        if (!content) { return; }
        const message: {token: string, message: Message} = {token: config.token, message: {content: content, name: config.name, time: Date.now()}};
        socket.emit("message", message);
        messageInput.value = "";
        messageInput.focus();
    };

    document.getElementById("sendMessageButton").onclick = sendMessage;
    
    messageInput.addEventListener("keydown", ev => {
        if (ev.key === "Enter" && !ev.getModifierState("Shift")) {
            sendMessage();
            ev.preventDefault();
        }
    });

    const buildMessage = (message: Message): HTMLDivElement => {
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

    socket.on("message", msg => {
        messageDiv.appendChild(buildMessage(msg as Message));
        messageDiv.scrollTop = messageDiv.scrollHeight;
    });

    const signout = () => {
        window.location.assign(refDir(window.location.href) + "login.html");
    };

    document.getElementById("signoutButton").onclick = signout;
    document.getElementById("removeButton").onclick = () => {
        fetch(refDir(window.location.href) + "api/leave", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(config)
        }).then(response => {
            if (response.ok) {
                localStorage.removeItem("userConfig");
                signout();
            } else {
                response.text().then(err => {
                    removeErrorSpan.innerText = err;
                });
            }
        });
    };

    const refresh = () => {
        socket.timeout(5000).emitWithAck("refresh").then((response: Message[]) => {
            messageDiv.innerText = "";
            response.forEach(message => {
                messageDiv.appendChild(buildMessage(message));
            });
            messageDiv.scrollTop = messageDiv.scrollHeight;
        });
    }

    refresh();
}