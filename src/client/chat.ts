window.onload = () => {
    document.getElementById("userInfoSpan").innerText = localStorage.getItem("user");
    document.getElementById("roomIdSpan").innerText = localStorage.getItem("roomId");
}