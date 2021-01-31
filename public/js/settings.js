/* global io, my, Howl */
const socket = io();
const params = window.location.toString().substring(window.location.toString().indexOf('?'));
const searchParams = new URLSearchParams(params);
const copyBtn = document.querySelector('#copy');

const pop = new Howl({
    src: ['audio/pop.mp3'],
});

function updateSettings(e) {
    e.preventDefault();
    socket.emit('settingsUpdate', {
        rounds: document.querySelector('#rounds').value,
        time: document.querySelector('#time').value,
    });
}

function putPlayer(player) {
    const div = document.createElement('div');
    const img = document.createElement('img');
    const p = document.createElement('p');
    const text = document.createTextNode(player.name);
    div.id = `skribblr-${player.id}`;
    p.appendChild(text);
    p.classList.add('text-center');
    img.src = player.avatar;
    img.alt = player.name;
    img.classList.add('img-fluid');
    div.classList.add('col-4', 'col-sm-3', 'col-md-4', 'col-lg-3');
    div.appendChild(img);
    div.appendChild(p);
    document.querySelector('#playersDiv').appendChild(div);
    if (my.name !== player.name) pop.play();
}

function showCanvasArea() {
    const sketchpad = document.createElement('script');
    const canvas = document.createElement('script');
    document.querySelector('#settings').remove();
    document.querySelector('#gameZone').classList.remove('d-none');
    sketchpad.src = 'https://cdn.jsdelivr.net/npm/responsive-sketchpad/dist/sketchpad.min.js';
    canvas.src = 'js/canvas.js';
    document.body.append(sketchpad);
    sketchpad.addEventListener('load', () => document.body.append(canvas));
}

socket.on('joinRoom', putPlayer);
socket.on('otherPlayers', (players) => players.forEach((player) => putPlayer(player)));
socket.on('disconnection', (player) => document.querySelector(`#skribblr-${player.id}`).remove());
socket.on('startGame', showCanvasArea);

if (searchParams.has('id')) {
    // player
    document.querySelector('#playGame').classList.remove('disabled');
    document.querySelector('#createRoom').classList.add('disabled');
    document.querySelector('#rounds').setAttribute('disabled', true);
    document.querySelector('#time').setAttribute('disabled', true);
    document.querySelector('#startGame').setAttribute('disabled', true);
} else {
    // room owner
    document.querySelector('#rounds').addEventListener('input', updateSettings);
    document.querySelector('#time').addEventListener('input', updateSettings);
}

copyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#gameLink').select();
    document.execCommand('copy');
});

document.querySelector('#createRoom').addEventListener('click', () => {
    document.querySelector('#landing').remove();
    document.querySelector('#settings').classList.remove('d-none');
    if (!searchParams.has('id')) {
        my.id = socket.id;
        socket.emit('newPrivateRoom', my);
        socket.on('newPrivateRoom', (data) => {
            document.querySelector('#gameLink').value = `${window.location.protocol}//${window.location.host}/?id=${data.gameID}`;
            putPlayer(my);
        });
    }
});

document.querySelector('#playGame').addEventListener('click', () => {
    document.querySelector('#landing').remove();
    document.querySelector('#settings').classList.remove('d-none');
    my.id = socket.id;
    if (searchParams.has('id')) {
        document.querySelector('#gameLink').value = `${window.location.protocol}//${window.location.host}/?id=${searchParams.get('id')}`;
        putPlayer(my);
    }
    socket.emit('joinRoom', { id: searchParams.get('id'), player: my });
});

document.querySelector('#startGame').addEventListener('click', () => {
    showCanvasArea();
    socket.emit('startGame');
    socket.emit('getPlayers');
});
