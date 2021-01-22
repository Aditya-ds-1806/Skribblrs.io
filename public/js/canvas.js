const canvas = document.getElementById('sketchpad');
const colors = Array.from(document.getElementsByClassName('color'));
const pad = new Sketchpad(canvas, {
    line: {
        size: 5
    },
    aspectRatio: 5 / 8
});
const current = {
    lineColor: "#000"
};
pad.setReadOnly(true);

colors.forEach(color => {
    color.addEventListener('click', e => {
        current.lineColor = e.target.className.split(' ')[1];
        pad.setLineColor(current.lineColor);
    }, false)
})

window.addEventListener('resize', () => pad.resize(canvas.offsetWidth));
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', throttle(onMouseUp, 10));
canvas.addEventListener('mousemove', throttle(onMouseMove, 10));

socket.on('clearCanvas', () => pad.clear());
socket.on('drawing', ({ start, end, lineColor }) => {
    const { width: w, height: h } = pad.getCanvasSize();
    start.x *= w;
    start.y *= h;
    end.x *= w;
    end.y *= h;
    current.lineColor = lineColor;
    pad.setLineColor(current.lineColor);
    pad.drawLine(start, end);
});
socket.on("disableCanvas", () => pad.setReadOnly(true));

function onMouseDown(e) {
    if (!pad.sketching) return;
    const rect = canvas.getBoundingClientRect();
    const { width: w, height: h } = pad.getCanvasSize();
    current.x = (e.clientX - rect.left) / w;
    current.y = (e.clientY - rect.top) / h;
}

function onMouseUp(e) {
    if (pad.readOnly) return;
    const rect = canvas.getBoundingClientRect();
    const { width: w, height: h } = pad.getCanvasSize();
    console.log("mouseup");
    socket.emit('drawing', {
        start: {
            x: current.x,
            y: current.y,
        },
        end: {
            x: (e.clientX - rect.left) / w,
            y: (e.clientY - rect.top) / h
        },
        lineColor: current.lineColor
    });
}

function onMouseMove(e) {
    if (!pad.sketching) return;
    const { width: w, height: h } = pad.getCanvasSize();
    const rect = canvas.getBoundingClientRect();
    socket.emit('drawing', {
        start: {
            x: current.x,
            y: current.y,
        },
        end: {
            x: (e.clientX - rect.left) / w,
            y: (e.clientY - rect.top) / h
        },
        lineColor: current.lineColor
    });
    current.x = (e.clientX - rect.left) / w;
    current.y = (e.clientY - rect.top) / h;
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