const express = require('express');
const app = express();
const socket = require('socket.io');
const { nanoid } = require('nanoid');

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index.ejs');
    // res.render('test.ejs');
});

var server = app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log(`Server listening on port ${process.env.PORT || 3000}`);
});


var io = socket(server);

io.on('connection', socket => {
    console.log("connected user");
    socket.on("newPrivateRoom", _ => {
        var id = nanoid(15);
        socket.emit('newPrivateRoom', { gameID: id });
        socket.join(id);
        console.log();
    });

    socket.on("joinRoom", data => {
        socket.join(data.id);
        socket.to(data.id).emit("join", "a new memeber has joined the room");
    });

    socket.on("settingsUpdate", data => {
        const roomID = Array.from(socket.rooms)[1];
        socket.to(roomID).emit("settingsUpdate", data);
    });
});
