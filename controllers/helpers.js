/* global MAX_POINTS, round */
const { readFileSync } = require('fs');

const words = JSON.parse(readFileSync('words.json').toString('utf-8'));

function getScore(startTime, roundtime) {
    const now = Date.now() / 1000;
    const elapsedTime = now - startTime;
    const roundTime = roundtime / 1000;
    return Math.floor(((roundTime - elapsedTime) / roundTime) * MAX_POINTS);
}

function wait(ms) {
    return new Promise((res) => {
        round.once('everybodyGuessed', res);
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

module.exports = {
    getScore,
    wait,
    get3Words,
};
