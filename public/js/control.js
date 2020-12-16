var socket = io();
var params = location.toString().substring(location.toString().indexOf('?'));
var searchParams = new URLSearchParams(params);
var copyBtn = document.querySelector("#copy");

if (searchParams.has("id")) {
    // player
    document.querySelector("#playGame").classList.remove('disabled');
    document.querySelector("#createRoom").classList.add('disabled');
    document.querySelector("#rounds").setAttribute('disabled', true);
    document.querySelector("#time").setAttribute('disabled', true);

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

copyBtn.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector("#gameLink").select();
    document.execCommand('copy');
});

document.querySelector("#createRoom").addEventListener('click', function () {
    document.querySelector("#landing").classList.add("d-none");
    document.querySelector("#settings").classList.remove("d-none");
    if (!searchParams.has("id")) {
        socket.emit("newPrivateRoom");
        socket.on("newPrivateRoom", function (data) {
            document.querySelector("#gameLink").value = `${location.protocol}//${location.host}/?id=${data.gameID}`;
        });
    }
});

document.querySelector("#playGame").addEventListener("click", function () {
    document.querySelector("#landing").classList.add("d-none");
    document.querySelector("#settings").classList.remove("d-none");
    if (searchParams.has("id")) {
        document.querySelector("#gameLink").value = `${location.protocol}//${location.host}/?id=${searchParams.get("id")}`;
    }
    socket.emit("joinRoom", { id: searchParams.get("id") });
});