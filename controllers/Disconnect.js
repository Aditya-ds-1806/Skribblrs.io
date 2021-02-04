/* global games */
const { getPlayersCount } = require('./helpers');

class Disconnect {
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;
    }

    onDisconnect() {
        const { socket } = this;
        const { roomID } = socket;
        if (socket.player) {
            socket.player.id = socket.id;
            socket.to(socket.roomID).emit('disconnection', socket.player);
        }
        delete games[roomID][socket.id];
        if (getPlayersCount(roomID) === 0) delete games[roomID];
    }
}

module.exports = Disconnect;
