/* global socket, pad, Howl, animateCSS, language */
let timerID = 0;
let pickWordID = 0;
let hints = [];

const yourTurn = new Howl({
    src: ['audio/your-turn.mp3'],
});

const clock = new Howl({
    src: ['audio/clock.mp3'],
});

const correct = new Howl({
    src: ['audio/correct.mp3'],
});

const gameOver = new Howl({
    src: ['audio/gameover.mp3'],
});

const click = new Howl({
    src: ['audio/click.mp3'],
});

const timerStart = new Howl({
    src: ['audio/timer-start.mp3'],
});

const hint = new Howl({
    src: ['audio/hint.mp3'],
});

document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('mousedown', () => click.play());
});

function chooseWord(word) {
    clearTimeout(pickWordID);
    pad.setReadOnly(false);
    socket.emit('chooseWord', { word });
    const p = document.createElement('p');
    p.textContent = word;
    p.classList.add('lead', 'fw-bold', 'mb-0');
    document.querySelector('#wordDiv').innerHTML = '';
    document.querySelector('#wordDiv').append(p);
}

function createScoreCard(players) {
    players.forEach((player) => {
        const div = document.createElement('div');
        const avatar = document.createElement('div');
        const details = document.createElement('div');
        const img = document.createElement('img');
        const p1 = document.createElement('p');
        const p2 = document.createElement('p');
        const name = document.createTextNode(player.name);
        const score = document.createTextNode('Score: 0');

        img.src = player.avatar;
        img.classList.add('img-fluid', 'rounded-circle');
        div.classList.add('row', 'justify-content-end', 'py-1', 'align-items-center');
        avatar.classList.add('col-5', 'col-xl-4');
        details.classList.add('col-7', 'col-xl-6', 'text-center', 'my-auto');
        p1.classList.add('mb-0');
        p2.classList.add('mb-0');
        div.id = `skribblr-${player.id}`;
        div.append(details, avatar);
        avatar.append(img);
        details.append(p1, p2);
        p1.append(name);
        p2.append(score);
        document.querySelector('.players').append(div);
    });
}

function startTimer(ms) {
    let secs = ms / 1000;
    const id = setInterval((function updateClock() {
        const wordP = document.querySelector('#wordDiv > p.lead.fw-bold.mb-0');
        if (secs === 0) clearInterval(id);
        if (secs === 10) clock.play();
        document.querySelector('#clock').textContent = secs;
        if (hints[0] && wordP && secs === hints[0].displayTime && pad.readOnly) {
            wordP.textContent = hints[0].hint;
            hint.play();
            animateCSS(wordP, 'tada', false);
            hints.shift();
        }
        secs--;
        return updateClock;
    }()), 1000);
    timerID = id;
    timerStart.play();
    document.querySelectorAll('.players .correct').forEach((player) => player.classList.remove('correct'));
}

function appendMessage({ name = '', message, id }, { correctGuess = false, closeGuess = false, lastWord = false } = {}) {
    const p = document.createElement('p');
    const chat = document.createTextNode(`${message}`);
    const messages = document.querySelector('.messages');
    if (name !== '') {
        const span = document.createElement('span');
        span.textContent = `${name}: `;
        span.classList.add('fw-bold');
        p.append(span);
    }
    p.classList.add('p-2', 'mb-0');
    if (closeGuess) p.classList.add('close');
    if (lastWord) p.classList.add('alert-warning');
    if (correctGuess) {
        document.getElementById(`skribblr-${id}`).classList.add('correct');
        p.classList.add('correct');
    }
    p.append(chat);
    messages.appendChild(p);
    messages.scrollTop = messages.scrollHeight;
    if (message === 'You guessed it right!') correct.play();
}

socket.on('getPlayers', (players) => createScoreCard(players));
socket.on('choosing', ({ name }) => {
    const p = document.createElement('p');
    p.textContent = `${name} is choosing a word`;
    p.classList.add('lead', 'fw-bold', 'mb-0');
    document.querySelector('#wordDiv').innerHTML = '';
    document.querySelector('#wordDiv').append(p);
    document.querySelector('#clock').textContent = 0;
    clearInterval(timerID);
    clock.stop();
});

socket.on('settingsUpdate', (data) => {
    document.querySelector('#rounds').value = data.rounds;
    document.querySelector('#time').value = data.time;
    document.querySelector('#language').value = data.language;
    // eslint-disable-next-line no-global-assign
    language = data.language;
    if (language === 'English') return;
    if (document.querySelector('#transliterate')) return;
    const script = document.createElement('script');
    script.id = 'transliterate';
    script.src = 'js/transliterate.js';
    document.body.append(script);
});

socket.on('hints', (data) => { hints = data; });

socket.on('chooseWord', async ([word1, word2, word3]) => {
    const p = document.createElement('p');
    const btn1 = document.createElement('button');
    const btn2 = document.createElement('button');
    const btn3 = document.createElement('button');
    const text = document.createTextNode('Choose a word');
    btn1.classList.add('btn', 'btn-outline-success', 'rounded-pill', 'mx-2');
    btn3.classList.add('btn', 'btn-outline-success', 'rounded-pill', 'mx-2');
    btn2.classList.add('btn', 'btn-outline-success', 'rounded-pill', 'mx-2');
    p.classList.add('lead', 'fw-bold');
    btn1.textContent = word1;
    btn2.textContent = word2;
    btn3.textContent = word3;
    btn1.addEventListener('click', () => chooseWord(word1));
    btn2.addEventListener('click', () => chooseWord(word2));
    btn3.addEventListener('click', () => chooseWord(word3));
    p.append(text);
    document.querySelector('#wordDiv').innerHTML = '';
    document.querySelector('#wordDiv').append(p, btn1, btn2, btn3);
    document.querySelector('#tools').classList.remove('d-none');
    await animateCSS('#tools', 'fadeInUp');
    document.querySelector('#clock').textContent = 0;
    clearInterval(timerID);
    clock.stop();
    yourTurn.play();
    pickWordID = setTimeout(() => chooseWord(word2), 15000);
});

socket.on('hideWord', ({ word }) => {
    const p = document.createElement('p');
    p.textContent = word;
    p.classList.add('lead', 'fw-bold', 'mb-0');
    p.style.letterSpacing = '0.5em';
    document.querySelector('#wordDiv').innerHTML = '';
    document.querySelector('#wordDiv').append(p);
});

socket.on('startTimer', ({ time }) => startTimer(time));
socket.on('message', appendMessage);
socket.on('closeGuess', (data) => appendMessage(data, { closeGuess: true }));
socket.on('correctGuess', (data) => appendMessage(data, { correctGuess: true }));
socket.on('lastWord', ({ word }) => appendMessage({ message: `The word was ${word}` }, { lastWord: true }));

socket.on('updateScore', ({
    playerID,
    score,
    drawerID,
    drawerScore,
}) => {
    document.querySelector(`#skribblr-${playerID}>div p:last-child`).textContent = `Score: ${score}`;
    document.querySelector(`#skribblr-${drawerID}>div p:last-child`).textContent = `Score: ${drawerScore}`;
});

socket.on('endGame', async ({ stats }) => {
    let players = Object.keys(stats).filter((val) => val.length === 20);
    players = players.sort((id1, id2) => stats[id2].score - stats[id1].score);

    clearInterval(timerID);
    document.querySelector('#clock').textContent = 0;
    await animateCSS('#gameZone', 'fadeOutLeft');
    document.querySelector('#gameZone').remove();

    players.forEach((playerID) => {
        const row = document.createElement('div');
        const imgDiv = document.createElement('div');
        const nameDiv = document.createElement('div');
        const scoreDiv = document.createElement('div');
        const name = document.createElement('p');
        const score = document.createElement('p');
        const avatar = new Image();

        avatar.src = stats[playerID].avatar;
        name.textContent = stats[playerID].name;
        score.textContent = stats[playerID].score;

        row.classList.add('row', 'mx-0', 'align-items-center');
        avatar.classList.add('img-fluid', 'rounded-circle');
        imgDiv.classList.add('col-2', 'text-center');
        nameDiv.classList.add('col-7', 'text-center');
        scoreDiv.classList.add('col-3', 'text-center');
        name.classList.add('display-6', 'fw-normal', 'mb-0');
        score.classList.add('display-6', 'fw-normal', 'mb-0');

        imgDiv.append(avatar);
        nameDiv.append(name);
        scoreDiv.append(score);
        row.append(imgDiv, nameDiv, scoreDiv);
        document.querySelector('#statsDiv').append(row, document.createElement('hr'));
    });
    clock.stop();
    gameOver.play();
    document.querySelector('#gameEnded').classList.remove('d-none');
    animateCSS('#gameEnded>div', 'fadeInRight');
});

// eslint-disable-next-line func-names
document.querySelector('#sendMessage').addEventListener('submit', function (e) {
    e.preventDefault();
    const message = this.firstElementChild.value;
    this.firstElementChild.value = '';
    socket.emit('message', { message });
});
