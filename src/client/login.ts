import { refDir } from "./hrefs.ts";

window.onload = () => {
    document.getElementById("joinButton").onclick = () => {
        fetch(refDir(window.location.href) + "api/join", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                room: (document.getElementById("roomInput") as HTMLInputElement).value,
                user: (document.getElementById("userInput") as HTMLInputElement).value,
            }),
        }).then(response => {
            if (response.ok) {
                response.json().then(json => {
                    console.log(json);
                })
            } else {
                response.text().then(err => {
                    console.error(err);
                });
            }
        });
    }
}