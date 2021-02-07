/* global games */
const { getPlayersCount } = require('./helpers');

class Disconnect {
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;
    }

    onDisconnect() {
        const { io, socket } = this;
        const { roomID } = socket;
        if (socket.player) {
            socket.player.id = socket.id;
            socket.to(socket.roomID).emit('disconnection', socket.player);
        }
        if (games[roomID]) {
            if (games[roomID][socket.id].score === 0) delete games[roomID][socket.id];
            if (getPlayersCount(roomID) === 0) delete games[roomID];
            if (io.in(roomID).sockets.sockets.size === 1) {
                io.to(roomID).emit('endGame', { stats: games[roomID] });
            }
        }
    }
}

module.exports = Disconnect;
