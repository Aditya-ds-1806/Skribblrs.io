/* global games, BONUS, round */
const leven = require('leven');
const { get3Words, getScore, wait } = require('./helpers');

class Game {
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;
    }

    chosenWord(playerID) {
        const { io } = this;
        return new Promise((resolve) => {
            const socket = io.of('/').sockets.get(playerID);
            socket.on('chooseWord', ({ word }) => {
                socket.to(socket.roomID).emit('hideWord', { word: word.replace(/[A-Za-z]/g, '_ ') });
                resolve(word);
            });
        });
    }

    resetGuessedFlag(players) {
        const { io } = this;
        players.forEach((playerID) => {
            const player = io.of('/').sockets.get(playerID);
            player.hasGuessed = false;
        });
    }

    async startGame() {
        const { io, socket } = this;
        const { time } = games[socket.roomID];
        const { rounds } = games[socket.roomID];
        const players = Array.from(await io.in(socket.roomID).allSockets());
        socket.to(socket.roomID).emit('startGame');
        for (let j = 0; j < rounds; j++) {
            /* eslint-disable no-await-in-loop */
            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                const prevPlayer = players[(i - 1 + players.length) % players.length];
                this.resetGuessedFlag(players);
                games[socket.roomID].totalGuesses = 0;
                games[socket.roomID].currentWord = '';
                games[socket.roomID].drawer = player;
                io.to(prevPlayer).emit('disableCanvas');
                io.to(socket.roomID).emit('choosing', { name: io.of('/').sockets.get(player).player.name });
                io.to(player).emit('chooseWord', get3Words());
                const word = await this.chosenWord(player);
                games[socket.roomID].currentWord = word;
                io.to(socket.roomID).emit('clearCanvas');
                games[socket.roomID].startTime = Date.now() / 1000;
                io.to(socket.roomID).emit('startTimer', { time });
                await wait(time);
            }
        }
    }

    onMessage(data) {
        const { io, socket } = this;
        if (data.message.trim() === '') return;
        const currentWord = games[socket.roomID].currentWord.toLowerCase();
        const distance = leven(data.message.toLowerCase(), currentWord);
        if (distance === 0 && currentWord !== '') {
            socket.emit('message', { ...data, name: socket.player.name });
            if (games[socket.roomID].drawer !== socket.id && !socket.hasGuessed) {
                const drawer = io.of('/').sockets.get(games[socket.roomID].drawer);
                const { startTime } = games[socket.roomID];
                const roundTime = games[socket.roomID].time;
                socket.emit('correctGuess');
                games[socket.roomID].totalGuesses++;
                games[socket.roomID][socket.id].score += getScore(startTime, roundTime);
                games[socket.roomID][drawer.id].score += BONUS;
                io.in(socket.roomID).emit('updateScore', {
                    playerID: socket.id,
                    score: games[socket.roomID][socket.id].score,
                    drawerID: drawer.id,
                    drawerScore: games[socket.roomID][drawer.id].score,
                });
                if (games[socket.roomID].totalGuesses === io.of('/').sockets.size - 1) {
                    round.emit('everybodyGuessed');
                }
            }
            socket.hasGuessed = true;
        } else if (distance < 3 && currentWord !== '') {
            io.in(socket.roomID).emit('message', { ...data, name: socket.player.name });
            if (games[socket.roomID].drawer !== socket.id && !socket.hasGuessed) socket.emit('closeGuess');
        } else {
            io.in(socket.roomID).emit('message', { ...data, name: socket.player.name });
        }
    }

    async getPlayer() {
        const { io, socket } = this;
        const players = Array.from(await io.in(socket.roomID).allSockets());
        io.in(socket.roomID).emit('getPlayers',
            players.reduce((acc, id) => {
                const { player } = io.of('/').sockets.get(id);
                acc.push(player);
                return acc;
            }, []));
    }
}

module.exports = Game;
