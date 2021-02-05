/* global MAX_POINTS, round, games */
const { readFileSync } = require('fs');

const words = JSON.parse(readFileSync('words.json').toString('utf-8'));

function getScore(startTime, roundtime) {
    const now = Date.now() / 1000;
    const elapsedTime = now - startTime;
    const roundTime = roundtime / 1000;
    return Math.floor(((roundTime - elapsedTime) / roundTime) * MAX_POINTS);
}

function wait(roomID, drawer, ms) {
    return new Promise((resolve, reject) => {
        round.on('everybodyGuessed', ({ roomID: callerRoomID }) => {
            if (callerRoomID === roomID) resolve();
        });
        drawer.on('disconnect', (err) => reject(err));
        setTimeout(resolve, ms);
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

function getPlayersCount(roomID) {
    return Object.keys(games[roomID]).filter((key) => key.length === 20).length;
}

module.exports = {
    getScore,
    wait,
    get3Words,
    getPlayersCount,
};
