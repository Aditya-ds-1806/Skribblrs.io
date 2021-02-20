/* global MAX_POINTS, round, games */
const { readFileSync } = require('fs');
const Chance = require('chance');

const chance = new Chance();
const words = JSON.parse(readFileSync('words.json').toString('utf-8'));

function getScore(startTime, roundtime) {
    const now = Date.now() / 1000;
    const elapsedTime = now - startTime;
    const roundTime = roundtime / 1000;
    return Math.floor(((roundTime - elapsedTime) / roundTime) * MAX_POINTS);
}

function populateDisplayTime(hints, roomID) {
    const roundTime = games[roomID].time;
    const startTime = Math.floor(roundTime / 2);
    const hintInterval = Math.floor(startTime / hints.length);
    return hints.map((hint, i) => ({
        hint,
        displayTime: Math.floor((startTime - (i * hintInterval)) / 1000),
    }));
}

function getHints(word, roomID) {
    const hints = [];
    const hintsCount = Math.floor(0.7 * word.length);
    let prevHint = word.split('').map((char) => (char !== ' ' ? '_' : ' ')).join('');
    while (hints.length !== hintsCount) {
        const pos = chance.integer({ min: 0, max: word.length - 1 });
        // eslint-disable-next-line no-continue
        if (prevHint[pos] !== '_') continue;
        prevHint = `${prevHint.substring(0, pos)}${word[pos]}${prevHint.substring(pos + 1)}`;
        hints.push(prevHint);
    }
    return populateDisplayTime(hints, roomID);
}

function wait(roomID, drawer, ms) {
    return new Promise((resolve, reject) => {
        round.on('everybodyGuessed', ({ roomID: callerRoomID }) => {
            if (callerRoomID === roomID) resolve();
        });
        drawer.on('disconnect', (err) => reject(err));
        setTimeout(() => resolve(true), ms);
    });
}

function get3Words(roomID) {
    if (games[roomID].customWords.length < 3) return chance.pickset(words, 3);
    const pickedWords = new Set();
    const { probability: p } = games[roomID];
    while (pickedWords.size !== 3) {
        const wordSet = chance.weighted([words, games[roomID].customWords], [1 - p, p]);
        pickedWords.add(chance.pickone(wordSet));
    }
    return Array.from(pickedWords);
}

function getPlayersCount(roomID) {
    return Object.keys(games[roomID]).filter((key) => key.length === 20).length;
}

module.exports = {
    getScore,
    getHints,
    wait,
    get3Words,
    getPlayersCount,
};
