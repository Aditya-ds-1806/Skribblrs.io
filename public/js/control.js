var socket = io();
var params = location.toString().substring(location.toString().indexOf('?'));
var searchParams = new URLSearchParams(params);
var copyBtn = document.querySelector("#copy");

socket.on('join', data => {
    console.log(data);
})

if (searchParams.has("id")) {
    document.querySelector("#playGame").classList.remove('disabled');
    document.querySelector("#createRoom").classList.add('disabled');
};
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