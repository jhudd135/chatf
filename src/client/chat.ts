import { Socket } from "socket.io";

export function init(socket: Socket) {
    document.getElementById("userInfoSpan").innerText = localStorage.getItem("user");
    document.getElementById("roomIdSpan").innerText = localStorage.getItem("roomId");
    console.log(socket);
}