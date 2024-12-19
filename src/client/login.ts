import { refDir } from "./hrefs.ts";

window.onload = () => {
    document.getElementById("joinButton").onclick = () => {
        const room = (document.getElementById("roomInput") as HTMLInputElement).value;
        const messageSpan = document.getElementById("messageSpan");
        fetch(refDir(window.location.href) + "api/join", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                room: room,
                user: (document.getElementById("userInput") as HTMLInputElement).value,
                token: (document.getElementById("tokenInput") as HTMLInputElement).value
            })
        }).then(response => {
            if (response.ok) {
                response.json().then(json => {
                    localStorage.setItem("user", JSON.stringify(json));
                    localStorage.setItem("roomId", room);
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