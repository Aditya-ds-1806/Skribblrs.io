const socket = io();
var params = location.toString().substring(location.toString().indexOf('?'));
var searchParams = new URLSearchParams(params);
var copyBtn = document.querySelector("#copy");

socket.on("joinRoom", putPlayer);
socket.on("otherPlayers", players => players.forEach(player => putPlayer(player)));
socket.on("disconnection", player => document.querySelector(`#skribblr-${player.id}`).remove());
socket.on("startGame", showCanvasArea);

if (searchParams.has("id")) {
    // player
    document.querySelector("#playGame").classList.remove('disabled');
    document.querySelector("#createRoom").classList.add('disabled');
    document.querySelector("#rounds").setAttribute('disabled', true);
    document.querySelector("#time").setAttribute('disabled', true);
    document.querySelector("#startGame").setAttribute('disabled', true);
} else {
    // room owner
    document.querySelector("#rounds").addEventListener('input', updateSettings);
    document.querySelector("#time").addEventListener('input', updateSettings);
}

copyBtn.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector("#gameLink").select();
    document.execCommand('copy');
});

document.querySelector("#createRoom").addEventListener('click', function () {
    document.querySelector("#landing").remove();
    document.querySelector("#settings").classList.remove("d-none");
    if (!searchParams.has("id")) {
        my.id = socket.id;
        socket.emit("newPrivateRoom", my);
        socket.on("newPrivateRoom", function (data) {
            document.querySelector("#gameLink").value = `${location.protocol}//${location.host}/?id=${data.gameID}`;
            putPlayer(my);
        });
    }
});

document.querySelector("#playGame").addEventListener("click", function () {
    document.querySelector("#landing").remove();
    document.querySelector("#settings").classList.remove("d-none");
    my.id = socket.id;
    if (searchParams.has("id")) {
        document.querySelector("#gameLink").value = `${location.protocol}//${location.host}/?id=${searchParams.get("id")}`;
        putPlayer(my);
    }
    socket.emit("joinRoom", { id: searchParams.get("id"), player: my });
});

document.querySelector("#startGame").addEventListener("click", async function () {
    showCanvasArea();
    socket.emit("startGame");
    socket.emit("getPlayers");
});

function updateSettings(e) {
    e.preventDefault();
    socket.emit("settingsUpdate", {
        rounds: document.querySelector("#rounds").value,
        time: document.querySelector("#time").value
    });
}

function putPlayer(player) {
    var div = document.createElement("div");
    var img = document.createElement("img");
    var p = document.createElement("p");
    var text = document.createTextNode(player.name);
    div.id = `skribblr-${player.id}`;
    p.appendChild(text);
    p.classList.add("text-center");
    img.src = player.avatar;
    img.alt = player.name;
    img.classList.add("img-fluid");
    div.classList.add("col-3");
    div.appendChild(img);
    div.appendChild(p);
    document.querySelector("#playersDiv").appendChild(div);
}

function showCanvasArea() {
    var sketchpad = document.createElement('script');
    var canvas = document.createElement('script');
    document.querySelector("#settings").remove();
    document.querySelector("#gameZone").classList.remove("d-none");
    sketchpad.src = "https://cdn.jsdelivr.net/npm/responsive-sketchpad/dist/sketchpad.min.js";
    canvas.src = "js/canvas.js";
    document.body.append(sketchpad);
    sketchpad.addEventListener('load', e => document.body.append(canvas));
}