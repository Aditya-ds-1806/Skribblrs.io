const canvas = document.getElementById('sketchpad');
const colors = Array.from(document.getElementsByClassName('color'));
const pad = new Sketchpad(canvas, {
    line: {
        size: 5
    },
    aspectRatio: 5 / 8
});
pad.setReadOnly(true);

colors.forEach(color => {
    color.addEventListener('click', e => pad.setLineColor(e.target.className.split(' ')[1], false));
})

for (var i = 0; i < colors.length; i++) {
    colors[i].addEventListener('click', e => pad.setLineColor(e.target.className.split(' ')[1], false));
}

window.addEventListener('resize', () => pad.resize(canvas.offsetWidth));
canvas.addEventListener('mousemove', () => throttle(onMouseMove, 10), false);

socket.on('clearCanvas', () => pad.clear());
socket.on('drawing', data => pad.loadJSON(data));
socket.on("disableCanvas", () => pad.setReadOnly(true));

function onMouseMove(e) {
    if (!pad.sketching) return;
    socket.emit('drawing', pad.toJSON());
}

// limit the number of events per second
function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function () {
        var time = new Date().getTime();

        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
        }
    };
}