import { Socket } from "socket.io";

export type Message = {content: string, name: string, time: number};

export function init(io: (...args: any) => Socket) {
    const user: {name: string, token: string} = JSON.parse(localStorage.getItem("user"));
    const roomId = localStorage.getItem("room");
    document.getElementById("userInfoSpan").innerText = user.name + ":" + user.token;
    document.getElementById("roomSpan").innerText = roomId;

    const messageInput = document.getElementById("messageInput") as HTMLButtonElement;
    const messageDiv = document.getElementById("messageDiv");

    const socket = io({auth: {token: user.token, room: roomId}});

    document.getElementById("sendMessageButton").onclick = () => {
        if (messageInput.value) {
            const message: Message = {content: messageInput.value, name: user.name, time: Date.now()};
            socket.emit("message", JSON.stringify(message));
            messageInput.value = "";
        }
    };

    socket.on("message", msg => {
        const message = JSON.parse(msg) as Message;
        const div = document.createElement("p");
        div.innerText = message.name + " @ " + new Date(message.time).toLocaleString("en-US") + " : " + message.content;
        messageDiv.appendChild(div);
        messageDiv.scrollTop = messageDiv.scrollHeight;
    });
}