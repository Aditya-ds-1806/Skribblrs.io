const { EventEmitter } = require('events');
const { readFileSync } = require('fs');
const socketio = require('socket.io');
const { nanoid } = require('nanoid');
const leven = require('leven');

const words = JSON.parse(readFileSync('words.json').toString('utf-8'));
const round = new EventEmitter();
const MAX_POINTS = 500;
const BONUS = 250;
const games = {};

module.exports.init = (server) => {
    const io = socketio(server);

    function getScore(startTime, roundtime) {
        const now = Date.now() / 1000;
        const elapsedTime = now - startTime;
        const roundTime = roundtime / 1000;
        return Math.floor(((roundTime - elapsedTime) / roundTime) * MAX_POINTS);
    }

    function resetGuessedFlag(players) {
        players.forEach((playerID) => {
            const player = io.of('/').sockets.get(playerID);
            player.hasGuessed = false;
        });
    }

    function wait(ms) {
        return new Promise((res) => {
            round.on('everybodyGuessed', res);
            setTimeout(res, ms);
        });
    }

    function get3Words() {
        const arr = [];
        for (let i = 0; i < 3; i++) {
            const index = Math.floor(Math.random() * (words.length + 1));
            const word = words[index];
            arr.push(word);
        }
        return arr;
    }

    function chosenWord(playerID) {
        return new Promise((resolve) => {
            const socket = io.of('/').sockets.get(playerID);
            socket.on('chooseWord', ({ word }) => {
                socket.to(socket.roomID).emit('hideWord', { word: word.replace(/[A-Za-z]/g, '_ ') });
                resolve(word);
            });
        });
    }

    io.on('connection', (socket) => {
        console.log('connected user');
        socket.on('newPrivateRoom', (player) => {
            const id = nanoid(15);
            games[id] = {
                rounds: 2,
                time: 40 * 1000,
            };
            games[id][socket.id] = {};
            games[id][socket.id].score = 0;
            console.log(games);
            socket.player = player;
            socket.roomID = id;
            socket.join(id);
            socket.emit('newPrivateRoom', { gameID: id });
        });

        socket.on('joinRoom', async (data) => {
            socket.player = data.player;
            socket.join(data.id);
            const roomID = Array.from(socket.rooms)[1];
            socket.roomID = roomID;
            socket.to(data.id).emit('joinRoom', data.player);
            let players = await io.in(roomID).allSockets();
            players = Array.from(players);
            socket.emit('otherPlayers',
                players.reduce((acc, id) => {
                    if (socket.id !== id) {
                        const { player } = io.of('/').sockets.get(id);
                        acc.push(player);
                    }
                    return acc;
                }, []));
            games[roomID][socket.id] = {};
            games[roomID][socket.id].score = 0;
            console.log(games);
        });

        socket.on('settingsUpdate', (data) => {
            games[socket.roomID].time = Number(data.time) * 1000;
            games[socket.roomID].rounds = Number(data.rounds);
            socket.to(socket.roomID).emit('settingsUpdate', data);
        });

        socket.on('drawing', (data) => {
            socket.broadcast.to(socket.roomID).emit('drawing', data);
        });

        socket.on('clearCanvas', () => {
            socket.broadcast.to(socket.roomID).emit('clearCanvas');
        });

        socket.on('startGame', async () => {
            socket.to(socket.roomID).emit('startGame');
            const { time } = games[socket.roomID];
            const { rounds } = games[socket.roomID];
            const players = Array.from(await io.in(socket.roomID).allSockets());
            for (let j = 0; j < rounds; j++) {
                /* eslint-disable no-await-in-loop */
                for (let i = 0; i < players.length; i++) {
                    const player = players[i];
                    const prevPlayer = players[(i - 1 + players.length) % players.length];
                    resetGuessedFlag(players);
                    games[socket.roomID].totalGuesses = 0;
                    games[socket.roomID].currentWord = '';
                    games[socket.roomID].drawer = player;
                    io.to(prevPlayer).emit('disableCanvas');
                    io.to(socket.roomID).emit('choosing', { name: io.of('/').sockets.get(player).player.name });
                    io.to(player).emit('chooseWord', get3Words());
                    const word = await chosenWord(player);
                    games[socket.roomID].currentWord = word;
                    io.to(socket.roomID).emit('clearCanvas');
                    games[socket.roomID].startTime = Date.now() / 1000;
                    io.to(socket.roomID).emit('startTimer', { time });
                    await wait(time);
                }
            }
        });

        socket.on('getPlayers', async () => {
            const players = Array.from(await io.in(socket.roomID).allSockets());
            io.in(socket.roomID).emit('getPlayers',
                players.reduce((acc, id) => {
                    const { player } = io.of('/').sockets.get(id);
                    acc.push(player);
                    return acc;
                }, []));
        });

        socket.on('message', (data) => {
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
        });

        socket.on('disconnect', () => {
            if (socket.player) {
                socket.player.id = socket.id;
                socket.to(socket.roomID).emit('disconnection', socket.player);
            }
        });
    });
};
