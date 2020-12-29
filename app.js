const { readFileSync } = require('fs');
const express = require('express');
const app = express();
const socket = require('socket.io');
const { nanoid } = require('nanoid');

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    var words = JSON.parse(readFileSync('words.json').toString('utf-8'));
    var index = Math.floor(Math.random() * (words.length + 1));
    res.render('index', { word: words[index] });
});

var server = app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log(`Server listening on port ${process.env.PORT || 3000}`);
});


var io = socket(server);

io.on('connection', socket => {
    console.log("connected user");
    socket.on("newPrivateRoom", player => {
        var id = nanoid(15);
        socket.player = player;
        socket.player.id = socket.id;
        socket.roomID = id;
        socket.join(id);
        socket.emit('newPrivateRoom', { gameID: id });
    });

    socket.on("joinRoom", async function (data) {
        socket.player = data.player;
        data.player.id = socket.id;
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
        socket.to(socket.roomID).emit("settingsUpdate", data);
    });

    socket.on("drawing", data => {
        socket.broadcast.to(socket.roomID).emit("drawing", data);
    });

    socket.on("disconnect", reason => {
        if (socket.player) {
            socket.player.id = socket.id;
            socket.to(socket.roomID).emit("disconnection", socket.player);
        }
    });
});
