import { refDir } from "./hrefs.ts";

window.onload = () => {
    const roomInput = document.getElementById("roomInput") as HTMLInputElement;
    const userInput = document.getElementById("userInput") as HTMLInputElement;
    const tokenInput = document.getElementById("tokenInput") as HTMLInputElement;
    const messageSpan = document.getElementById("messageSpan");

    roomInput.value = localStorage.getItem("room");
    const storedUser: {name: string, token: string} = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
        userInput.value = storedUser.name;
        tokenInput.value = storedUser.token;
    }

    document.getElementById("joinButton").onclick = () => {
        const room = roomInput.value;
        
        fetch(refDir(window.location.href) + "api/join", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                room: room,
                name: userInput.value,
                token: tokenInput.value
            })
        }).then(response => {
            if (response.ok) {
                response.json().then(json => {
                    localStorage.setItem("user", JSON.stringify(json));
                    localStorage.setItem("room", room);
                    window.location.assign(refDir(window.location.href) + "chat.html");
                })
            } else {
                response.text().then(err => {
                    messageSpan.innerText = err;
                });
            }
        });
    }
};