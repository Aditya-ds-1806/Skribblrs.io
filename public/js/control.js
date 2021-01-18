var socket = io();
var params = location.toString().substring(location.toString().indexOf('?'));
var searchParams = new URLSearchParams(params);
var copyBtn = document.querySelector("#copy");

socket.on("joinRoom", putPlayer);
socket.on("otherPlayers", players => players.forEach(player => putPlayer(player)));
socket.on("disconnection", player => document.querySelector(`#${player.id}`).remove());
socket.on("startGame", showCanvasArea);
socket.on("getPlayers", players => createScoreCard(players));
socket.on("choosing", ({ name }) => {
    var p = document.createElement('p');
    p.textContent = `${name} is choosing a word`;
    p.classList.add("lead", "fw-bold", "mb-0");
    document.querySelector("#wordDiv").innerHTML = "";
    document.querySelector("#wordDiv").append(p);
});
socket.on("hideWord", ({ word }) => {
    var p = document.createElement('p');
    p.textContent = word;
    p.classList.add("lead", "fw-bold", "mb-0");
    document.querySelector("#wordDiv").innerHTML = "";
    document.querySelector("#wordDiv").append(p);
});
socket.on("startTimer", ({ time }) => startTimer(time));

socket.on("message", ({ name, message }) => {
    var p = document.createElement("p");
    var chat = document.createTextNode(`${name}: ${message}`);
    p.classList.add("p-2", "mb-0");
    p.append(chat);
    document.querySelector(".messages").appendChild(p);
});

socket.on("closeGuess", () => {
    var p = document.createElement("p");
    var chat = document.createTextNode("That was very close!!!");
    p.classList.add("p-2", "mb-0", "alert-warning");
    p.append(chat);
    document.querySelector(".messages").appendChild(p);
});

socket.on("correctGuess", () => {
    var p = document.createElement("p");
    var chat = document.createTextNode("You guessed it right!!!");
    p.classList.add("p-2", "mb-0", "alert-success");
    p.append(chat);
    document.querySelector(".messages").appendChild(p);
});

document.querySelector("#sendMessage").addEventListener("submit", function (e) {
    e.preventDefault();
    const message = this.firstElementChild.value;
    this.firstElementChild.value = "";
    socket.emit("message", { message: message });
})

if (searchParams.has("id")) {
    // player
    document.querySelector("#playGame").classList.remove('disabled');
    document.querySelector("#createRoom").classList.add('disabled');
    document.querySelector("#rounds").setAttribute('disabled', true);
    document.querySelector("#time").setAttribute('disabled', true);
    document.querySelector("#startGame").setAttribute('disabled', true);

    socket.on("settingsUpdate", data => {
        document.querySelector("#rounds").value = data.rounds;
        document.querySelector("#time").value = data.time;
    });
} else {
    // room owner
    document.querySelector("#rounds").addEventListener('input', updateSettings);
    document.querySelector("#time").addEventListener('input', updateSettings);
}

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
    div.id = player.id;
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

function createScoreCard(players) {
    players.forEach(player => {
        var div = document.createElement('div');
        var avatar = document.createElement('div');
        var details = document.createElement('div');
        var img = document.createElement('img');
        var p1 = document.createElement('p');
        var p2 = document.createElement('p');
        var name = document.createTextNode(player.name);
        var score = document.createTextNode("Score: 0");

        img.src = player.avatar;
        img.classList.add("img-fluid");
        div.classList.add("row", "justify-content-end", "bg-white", "py-1");
        avatar.classList.add("col-4");
        details.classList.add("col-6", "text-center", "my-auto");
        p1.classList.add("mb-0");
        p2.classList.add("mb-0");
        div.append(details, avatar);
        avatar.append(img);
        details.append(p1, p2);
        p1.append(name);
        p2.append(score);
        document.querySelector(".players").append(div);
    });
}

function startTimer(ms) {
    var secs = ms / 1000;
    var id = setInterval(function () {
        if (secs === 0) clearInterval(id);
        document.querySelector("#clock").textContent = secs;
        secs--;
    }, 1000);
    socket.on("choosing", () => {
        clearInterval(id);
        document.querySelector("#clock").textContent = 0;
    });
}

function showCanvasArea() {
    var script = document.createElement('script');
    document.querySelector("#settings").remove();
    document.querySelector("#gameZone").classList.remove("d-none");
    script.src = "js/canvas.js";
    document.body.append(script);
    return new Promise((res) => {
        script.addEventListener('load', e => res());
    })
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
    await showCanvasArea();
    socket.emit("startGame");
    socket.emit("getPlayers");
});