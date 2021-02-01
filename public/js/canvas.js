/* global Sketchpad, socket, animateCSS */
const canvas = document.getElementById('sketchpad');
const smBrush = document.getElementById('sm-brush');
const mdBrush = document.getElementById('md-brush');
const lgBrush = document.getElementById('lg-brush');
const xlBrush = document.getElementById('xl-brush');
const clearCanvas = document.getElementById('clearCanvas');
const colors = Array.from(document.getElementsByClassName('color'));
const pad = new Sketchpad(canvas, {
    line: {
        size: 5,
    },
    aspectRatio: 5 / 8,
});
const current = {
    lineColor: '#000',
    lineSize: 5,
};
pad.setReadOnly(true);

function setLineSize() {
    if (pad.readOnly) return;
    current.lineSize = Number(this.dataset.linesize);
    pad.setLineSize(Number(this.dataset.linesize));
}

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
    socket.emit('drawing', {
        start: {
            x: current.x,
            y: current.y,
        },
        end: {
            x: (e.clientX - rect.left) / w,
            y: (e.clientY - rect.top) / h,
        },
        lineColor: current.lineColor,
        lineSize: current.lineSize,
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
            y: (e.clientY - rect.top) / h,
        },
        lineColor: current.lineColor,
        lineSize: current.lineSize,
    });
    current.x = (e.clientX - rect.left) / w;
    current.y = (e.clientY - rect.top) / h;
}

// limit the number of events per second
function throttle(callback, delay) {
    let previousCall = new Date().getTime();
    return (...args) => {
        const time = new Date().getTime();
        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback(...args);
        }
    };
}

colors.forEach((color) => {
    // eslint-disable-next-line func-names
    color.addEventListener('click', function () {
        if (pad.readOnly) return;
        current.lineColor = getComputedStyle(this).backgroundColor;
        pad.setLineColor(current.lineColor);
        document.querySelector('.selected-color').style.backgroundColor = current.lineColor;
    }, false);
});

smBrush.addEventListener('click', setLineSize);
mdBrush.addEventListener('click', setLineSize);
lgBrush.addEventListener('click', setLineSize);
xlBrush.addEventListener('click', setLineSize);
clearCanvas.addEventListener('click', () => {
    if (pad.readOnly) return;
    socket.emit('clearCanvas');
    pad.clear();
});

window.addEventListener('resize', () => pad.resize(canvas.offsetWidth));
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', throttle(onMouseUp, 10));
canvas.addEventListener('mousemove', throttle(onMouseMove, 10));

socket.on('clearCanvas', () => pad.clear());
socket.on('drawing', ({
    start,
    end,
    lineColor,
    lineSize,
}) => {
    const { width: w, height: h } = pad.getCanvasSize();
    start.x *= w;
    start.y *= h;
    end.x *= w;
    end.y *= h;
    pad.setLineColor(lineColor);
    pad.setLineSize(lineSize);
    pad.drawLine(start, end);
    pad.setLineColor(current.lineColor);
    pad.setLineSize(current.lineSize);
});
socket.on('disableCanvas', async () => {
    pad.setReadOnly(true);
    await animateCSS('#tools', 'fadeOutDown');
    document.querySelector('#tools').classList.add('d-none');
});
