const { readFileSync } = require('fs');
const express = require('express');
const app = express();
const socket = require('socket.io');
const { nanoid } = require('nanoid');
const leven = require('leven');
const words = JSON.parse(readFileSync('words.json').toString('utf-8'));
var games = {};

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index');
});

var server = app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log(`Server listening on port ${process.env.PORT || 3000}`);
});


var io = socket(server);

io.on('connection', socket => {
    console.log("connected user");
    socket.on("newPrivateRoom", player => {
        var id = nanoid(15);
        games[id] = {
            rounds: 2,
            time: 40 * 1000
        }
        console.log(games);
        socket.player = player;
        socket.roomID = id;
        socket.join(id);
        socket.emit('newPrivateRoom', { gameID: id });
    });

    socket.on("joinRoom", async function (data) {
        socket.player = data.player;
        socket.join(data.id);
        const roomID = Array.from(socket.rooms)[1];
        socket.roomID = roomID;
        socket.to(data.id).emit("joinRoom", data.player);
        var players = await io.in(roomID).allSockets();
        players = Array.from(players);
        socket.emit("otherPlayers",
            players.reduce((acc, id) => {
                if (socket.id !== id) {
                    const player = io.of('/').sockets.get(id).player;
                    acc.push(player);
                }
                return acc;
            }, [])
        );
    });

    socket.on("settingsUpdate", data => {
        games[socket.roomID].time = Number(data.time) * 1000;
        games[socket.roomID].rounds = Number(data.rounds);
        socket.to(socket.roomID).emit("settingsUpdate", data);
    });

    socket.on("drawing", data => {
        socket.broadcast.to(socket.roomID).emit("drawing", data);
    });

    socket.on("startGame", async _ => {
        socket.to(socket.roomID).emit("startGame");
        var time = games[socket.roomID].time;
        var rounds = games[socket.roomID].rounds;
        var players = Array.from(await io.in(socket.roomID).allSockets());
        for (j = 0; j < rounds; j++) {
            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                const prevPlayer = players[(i - 1 + players.length) % players.length];
                games[socket.roomID].currentWord = "";
                io.to(prevPlayer).emit("disableCanvas");
                io.to(socket.roomID).emit("choosing", { name: io.of("/").sockets.get(player).player.name })
                io.to(player).emit("chooseWord", get3Words());
                var word = await chosenWord(player);
                games[socket.roomID].currentWord = word;
                io.to(socket.roomID).emit("clearCanvas");
                io.to(socket.roomID).emit("startTimer", { time: time });
                await wait(time);
            }
        }
    });

    socket.on("getPlayers", async _ => {
        var players = Array.from(await io.in(socket.roomID).allSockets());
        io.in(socket.roomID).emit("getPlayers",
            players.reduce((acc, id) => {
                const player = io.of('/').sockets.get(id).player;
                acc.push(player);
                return acc;
            }, []))
    });

    socket.on("message", data => {
        if (data.message.trim() === "") return;
        const currentWord = games[socket.roomID].currentWord.toLowerCase();
        const distance = leven(data.message.toLowerCase(), currentWord);
        data.name = socket.player.name;
        if (distance == 0) {
            socket.emit("message", data);
            if (currentWord !== "") socket.emit("correctGuess");
        } else if (distance < 3) {
            io.in(socket.roomID).emit("message", data);
            if (currentWord !== "") socket.emit("closeGuess");
        } else {
            io.in(socket.roomID).emit("message", data);
        }
    });

    socket.on("disconnect", reason => {
        if (socket.player) {
            socket.player.id = socket.id;
            socket.to(socket.roomID).emit("disconnection", socket.player);
        }
    });
});

function wait(ms) {
    return new Promise(res => setTimeout(res, ms));
}

function get3Words() {
    var arr = [];
    for (let i = 0; i < 3; i++) {
        var index = Math.floor(Math.random() * (words.length + 1));
        var word = words[index];
        arr.push(word);
    }
    return arr;
}

function chosenWord(playerID) {
    return new Promise(resolve => {
        const socket = io.of('/').sockets.get(playerID);
        socket.on("chooseWord", ({ word }) => {
            socket.to(socket.roomID).emit("hideWord", { word: word.replace(/[A-Za-z]/g, "_ ") });
            resolve(word);
        });
    });
}