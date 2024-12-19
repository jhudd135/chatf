window.onload = () => {
    document.getElementById("submitButton").onclick = () => {
        fetch(window.location.href + "test?room=" + (document.getElementById("roomInput") as HTMLInputElement).value);
    }
}