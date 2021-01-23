const style = document.querySelector('#style');
const bgColor = document.querySelector('#bgColor');
const playerName = document.querySelector('#playerName');
const baseURL = 'https://avatars.dicebear.com/api';
const my = {
    name: '',
    avatar: 'https://avatars.dicebear.com/api/avataaars/.svg',
};

const settings = document.createElement('script');
const game = document.createElement('script');
settings.src = 'js/settings.js';
game.src = 'js/game.js';
document.body.append(settings, game);

function updateAvatar() {
    const sprite = style.value.toLowerCase();
    const color = bgColor.value.substring(1);
    const url = `${baseURL}/${sprite}/${playerName.value}.svg?b=%23${color}`;
    const newAvatar = document.createElement('img');
    newAvatar.src = url;
    newAvatar.alt = 'Avatar';
    newAvatar.id = 'avatar';
    newAvatar.classList.add('img-fluid');
    newAvatar.addEventListener('load', () => {
        document.querySelector('#avatar').replaceWith(newAvatar);
    });
    my.avatar = url;
    my.name = playerName.value;
}

style.addEventListener('input', updateAvatar);
bgColor.addEventListener('input', updateAvatar);
playerName.addEventListener('change', updateAvatar);
