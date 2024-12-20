import { refDir } from "./hrefs.ts";

export type UserConfig = {room: string, name: string, token: string};

window.onload = () => {
    const roomInput = document.getElementById("roomInput") as HTMLInputElement;
    const userInput = document.getElementById("userInput") as HTMLInputElement;
    const tokenInput = document.getElementById("tokenInput") as HTMLInputElement;
    const messageSpan = document.getElementById("messageSpan");

    const storedConfig: UserConfig = JSON.parse(localStorage.getItem("userConfig"));
    if (storedConfig) {
        roomInput.value = storedConfig.room;
        userInput.value = storedConfig.name;
        tokenInput.value = storedConfig.token;
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
                    localStorage.setItem("userConfig", JSON.stringify(json));
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