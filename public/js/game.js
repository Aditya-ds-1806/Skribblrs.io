socket.on("getPlayers", players => createScoreCard(players));
socket.on("choosing", ({ name }) => {
    var p = document.createElement('p');
    p.textContent = `${name} is choosing a word`;
    p.classList.add("lead", "fw-bold", "mb-0");
    document.querySelector("#wordDiv").innerHTML = "";
    document.querySelector("#wordDiv").append(p);
});

socket.on("settingsUpdate", data => {
    document.querySelector("#rounds").value = data.rounds;
    document.querySelector("#time").value = data.time;
});

socket.on("chooseWord", ([word1, word2, word3]) => {
    var p = document.createElement('p');
    var btn1 = document.createElement('button');
    var btn2 = document.createElement('button');
    var btn3 = document.createElement('button');
    var text = document.createTextNode("Choose a word");
    btn1.classList.add("btn", "btn-outline-success", "rounded-pill", "mx-2");
    btn3.classList.add("btn", "btn-outline-success", "rounded-pill", "mx-2");
    btn2.classList.add("btn", "btn-outline-success", "rounded-pill", "mx-2");
    p.classList.add("lead", "fw-bold");
    btn1.textContent = word1;
    btn2.textContent = word2;
    btn3.textContent = word3;
    btn1.addEventListener("click", chooseWord);
    btn2.addEventListener("click", chooseWord);
    btn3.addEventListener("click", chooseWord);
    p.append(text);
    document.querySelector("#wordDiv").innerHTML = "";
    document.querySelector("#wordDiv").append(p, btn1, btn2, btn3);
    document.querySelector("#tools").classList.remove("d-none");
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

socket.on("updateScore", ({ playerID, score, drawerID, drawerScore }) => {
    document.querySelector(`#skribblr-${playerID}>div p:last-child`).textContent = `Score: ${score}`;
    document.querySelector(`#skribblr-${drawerID}>div p:last-child`).textContent = `Score: ${drawerScore}`;
});

document.querySelector("#sendMessage").addEventListener("submit", function (e) {
    e.preventDefault();
    const message = this.firstElementChild.value;
    this.firstElementChild.value = "";
    socket.emit("message", { message: message });
});

function chooseWord(e) {
    e.preventDefault();
    pad.setReadOnly(false);
    socket.emit("chooseWord", { word: this.textContent });
    var p = document.createElement("p");
    p.textContent = this.textContent;
    p.classList.add("lead", "fw-bold", "mb-0");
    document.querySelector("#wordDiv").innerHTML = "";
    document.querySelector("#wordDiv").append(p);
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
        div.id = `skribblr-${player.id}`;
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
    var id = setInterval((function updateClock() {
        if (secs === 0) clearInterval(id);
        document.querySelector("#clock").textContent = secs;
        secs--;
        return updateClock;
    })(), 1000);
    socket.on("choosing", () => {
        clearInterval(id);
        document.querySelector("#clock").textContent = 0;
    });
}