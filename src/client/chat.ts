import { refDir } from "./hrefs.ts";
import { Socket } from "socket.io";

export type Message = {content: string, name: string, time: number};

export function init(io: (...args: any) => Socket) {
    const user: {name: string, token: string} = JSON.parse(localStorage.getItem("user"));
    const roomId = localStorage.getItem("room");
    document.getElementById("userInfoSpan").innerText = user.name + ":" + user.token;
    document.getElementById("roomHeader").innerText = roomId;

    const messageInput = document.getElementById("messageInput") as HTMLButtonElement;
    const messageDiv = document.getElementById("messageDiv");
    const removeErrorSpan = document.getElementById("removeErrorSpan");

    const socket = io({auth: {token: user.token, room: roomId}});

    const sendMessage = () => {
        if (messageInput.value) {
            const message: Message = {content: messageInput.value, name: user.name, time: Date.now()};
            socket.emit("message", JSON.stringify(message));
            messageInput.value = "";
            messageInput.focus();
        }
    };

    document.getElementById("sendMessageButton").onclick = sendMessage;
    
    messageInput.addEventListener("keyup", ev => {
        if (ev.key === "Enter") {
            sendMessage();
        }
    });

    const buildMessage = (message: Message): HTMLDivElement => {
        const div = document.createElement("p");
        div.innerText = message.name + " @ " + new Date(message.time).toLocaleString("en-US") + " : " + message.content;
        return div;
    }

    socket.on("message", msg => {
        messageDiv.appendChild(buildMessage(JSON.parse(msg) as Message));
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
            body: JSON.stringify({
                room: roomId,
                name: user.name,
                token: user.token
            })
        }).then(response => {
            if (response.ok) {
                localStorage.removeItem("user");
                localStorage.removeItem("room");
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