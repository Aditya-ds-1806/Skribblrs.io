const style = document.querySelector("#style");
const bgColor = document.querySelector("#bgColor");
const playerName = document.querySelector("#playerName");
const baseURL = "https://avatars.dicebear.com/api";

var my = {
    name: "",
    avatar: "https://avatars.dicebear.com/api/avataaars/.svg"
}

style.addEventListener('input', updateAvatar);
bgColor.addEventListener('input', updateAvatar);
playerName.addEventListener('change', updateAvatar);

function updateAvatar() {
    const sprite = style.value.toLowerCase();
    const color = bgColor.value.substring(1);
    var url = `${baseURL}/${sprite}/${playerName.value}.svg?b=%23${color}`;
    var newAvatar = document.createElement('img');
    newAvatar.src = url;
    newAvatar.alt = "Avatar";
    newAvatar.id = "avatar";
    newAvatar.classList.add("img-fluid");
    newAvatar.addEventListener('load', function () {
        document.querySelector("#avatar").replaceWith(newAvatar);
    });
    my.avatar = url;
    my.name = playerName.value;
}