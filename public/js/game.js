/* global socket, pad */
let intervalID = 0;

function chooseWord(e) {
    e.preventDefault();
    pad.setReadOnly(false);
    socket.emit('chooseWord', { word: this.textContent });
    const p = document.createElement('p');
    p.textContent = this.textContent;
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
        img.classList.add('img-fluid');
        div.classList.add('row', 'justify-content-end', 'bg-white', 'py-1');
        avatar.classList.add('col-4');
        details.classList.add('col-6', 'text-center', 'my-auto');
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
        if (secs === 0) clearInterval(id);
        document.querySelector('#clock').textContent = secs;
        secs--;
        return updateClock;
    }()), 1000);
    intervalID = id;
    socket.on('choosing', () => {
        clearInterval(id);
        document.querySelector('#clock').textContent = 0;
    });
}

socket.on('getPlayers', (players) => createScoreCard(players));
socket.on('choosing', ({ name }) => {
    const p = document.createElement('p');
    p.textContent = `${name} is choosing a word`;
    p.classList.add('lead', 'fw-bold', 'mb-0');
    document.querySelector('#wordDiv').innerHTML = '';
    document.querySelector('#wordDiv').append(p);
});

socket.on('settingsUpdate', (data) => {
    document.querySelector('#rounds').value = data.rounds;
    document.querySelector('#time').value = data.time;
});

socket.on('chooseWord', ([word1, word2, word3]) => {
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
    btn1.addEventListener('click', chooseWord);
    btn2.addEventListener('click', chooseWord);
    btn3.addEventListener('click', chooseWord);
    p.append(text);
    document.querySelector('#wordDiv').innerHTML = '';
    document.querySelector('#wordDiv').append(p, btn1, btn2, btn3);
    document.querySelector('#tools').classList.remove('d-none');
});

socket.on('hideWord', ({ word }) => {
    const p = document.createElement('p');
    p.textContent = word;
    p.classList.add('lead', 'fw-bold', 'mb-0');
    document.querySelector('#wordDiv').innerHTML = '';
    document.querySelector('#wordDiv').append(p);
});
socket.on('startTimer', ({ time }) => startTimer(time));

socket.on('message', ({ name, message }) => {
    const p = document.createElement('p');
    const chat = document.createTextNode(`${name}: ${message}`);
    p.classList.add('p-2', 'mb-0');
    p.append(chat);
    document.querySelector('.messages').appendChild(p);
});

socket.on('closeGuess', () => {
    const p = document.createElement('p');
    const chat = document.createTextNode('That was very close!!!');
    p.classList.add('p-2', 'mb-0', 'alert-warning');
    p.append(chat);
    document.querySelector('.messages').appendChild(p);
});

socket.on('correctGuess', () => {
    const p = document.createElement('p');
    const chat = document.createTextNode('You guessed it right!!!');
    p.classList.add('p-2', 'mb-0', 'alert-success');
    p.append(chat);
    document.querySelector('.messages').appendChild(p);
});

socket.on('updateScore', ({
    playerID,
    score,
    drawerID,
    drawerScore,
}) => {
    document.querySelector(`#skribblr-${playerID}>div p:last-child`).textContent = `Score: ${score}`;
    document.querySelector(`#skribblr-${drawerID}>div p:last-child`).textContent = `Score: ${drawerScore}`;
});

socket.on('endGame', ({ stats }) => {
    let players = Object.keys(stats).filter((val) => val.length === 20);
    players = players.sort((id1, id2) => stats[id2].score - stats[id1].score);

    clearInterval(intervalID);
    document.querySelector('#clock').textContent = 0;
    document.querySelector('#gameZone').classList.add('d-none');
    document.querySelector('#gameEnded').classList.remove('d-none');

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
});

// eslint-disable-next-line func-names
document.querySelector('#sendMessage').addEventListener('submit', function (e) {
    e.preventDefault();
    const message = this.firstElementChild.value;
    this.firstElementChild.value = '';
    socket.emit('message', { message });
});
