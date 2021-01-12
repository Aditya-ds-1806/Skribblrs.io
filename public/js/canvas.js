'use strict';

(function () {

    var rect = 0, scaleX = 1, scaleY = 1;
    var canvas = document.getElementsByClassName('whiteboard')[0];
    var colors = document.getElementsByClassName('color');
    var context = canvas.getContext('2d');

    var current = {
        color: 'black'
    };
    var drawing = false;

    for (var i = 0; i < colors.length; i++) {
        colors[i].addEventListener('click', onColorUpdate, false);
    }

    socket.on('drawing', onDrawingEvent);
    socket.on('clearCanvas', clearCanvas);

    socket.on("chooseWord", ([word1, word2, word3]) => {
        var p = document.createElement('p');
        var btn1 = document.createElement('button');
        var btn2 = document.createElement('button');
        var btn3 = document.createElement('button');
        var text = document.createTextNode("Choose a word");
        btn1.classList.add("btn", "btn-outline-success", "rounded-pill");
        btn3.classList.add("btn", "btn-outline-success", "rounded-pill");
        btn2.classList.add("btn", "btn-outline-success", "rounded-pill");
        p.classList.add("lead", "fw-bold");
        btn1.textContent = word1;
        btn2.textContent = word2;
        btn3.textContent = word3;
        btn1.addEventListener("click", chooseWord);
        btn2.addEventListener("click", chooseWord);
        btn3.addEventListener("click", chooseWord);
        p.append(text);
        document.querySelector("#wordDiv").innerHTML = "";
        document.querySelector("#wordDiv").append(p, btn1, btn2, btn3);
    });

    socket.on("disableCanvas", disableCanvas);

    window.addEventListener('resize', onResize, false);
    onResize();


    function drawLine(x0, y0, x1, y1, color, emit) {
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();

        if (!emit) { return; }
        var w = canvas.width;
        var h = canvas.height;

        socket.emit('drawing', {
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color: color
        });
    }

    function onMouseDown(e) {
        drawing = true;
        current.x = (e.clientX - rect.left) * scaleX || (e.touches[0].clientX - rect.left) * scaleX;
        current.y = (e.clientY - rect.top) * scaleY || (e.touches[0].clientY - rect.top) * scaleY;
    }

    function onMouseUp(e) {
        if (!drawing) { return; }
        drawing = false;
        drawLine(current.x, current.y, (e.clientX - rect.left) * scaleX || (e.touches[0].clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY || (e.touches[0].clientY - rect.top) * scaleY, current.color, true);
    }

    function onMouseMove(e) {
        if (!drawing) return;
        drawLine(current.x, current.y, (e.clientX - rect.left) * scaleX || (e.touches[0].clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY || (e.touches[0].clientY - rect.top) * scaleY, current.color, true);
        current.x = (e.clientX - rect.left) * scaleX || (e.touches[0].clientX - rect.left) * scaleX;
        current.y = (e.clientY - rect.top) * scaleY || (e.touches[0].clientY - rect.top) * scaleY;
    }

    function onColorUpdate(e) {
        current.color = e.target.className.split(' ')[1];
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

    function onDrawingEvent(data) {
        var w = canvas.width;
        var h = canvas.height;
        drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    }

    // make the canvas fill its parent
    function onResize() {
        var contents = context.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        rect = canvas.getBoundingClientRect();
        scaleX = canvas.width / rect.width;
        scaleY = canvas.height / rect.height;
        context.putImageData(contents, 0, 0);
    }

    function chooseWord(e) {
        e.preventDefault();
        enableCanvas();
        socket.emit("chooseWord", { word: this.textContent });
        var p = document.createElement("p");
        p.textContent = this.textContent;
        p.classList.add("lead", "fw-bold", "mb-0");
        document.querySelector("#wordDiv").innerHTML = "";
        document.querySelector("#wordDiv").append(p);
    }

    function enableCanvas() {
        canvas.addEventListener('mousedown', onMouseDown, false);
        canvas.addEventListener('mouseup', onMouseUp, false);
        canvas.addEventListener('mouseout', onMouseUp, false);
        canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

        //Touch support for mobile devices
        canvas.addEventListener('touchstart', onMouseDown, false);
        canvas.addEventListener('touchend', onMouseUp, false);
        canvas.addEventListener('touchcancel', onMouseUp, false);
        canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);
    }

    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function disableCanvas() {
        canvas.removeEventListener('mousedown', onMouseDown, false);
        canvas.removeEventListener('mouseup', onMouseUp, false);
        canvas.removeEventListener('mouseout', onMouseUp, false);
        canvas.removeEventListener('mousemove', throttle(onMouseMove, 10), false);

        //Touch support for mobile devices
        canvas.removeEventListener('touchstart', onMouseDown, false);
        canvas.removeEventListener('touchend', onMouseUp, false);
        canvas.removeEventListener('touchcancel', onMouseUp, false);
        canvas.removeEventListener('touchmove', throttle(onMouseMove, 10), false);
    }
})();