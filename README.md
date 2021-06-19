# Skribblrs.io

![CodeQL](https://github.com/Aditya-ds-1806/Skribblrs.io/workflows/CodeQL/badge.svg?branch=main)
![OSSAR](https://github.com/Aditya-ds-1806/Skribblrs.io/workflows/OSSAR/badge.svg?branch=main)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fskribblrs.herokuapp.com)
[![GitHub license](https://img.shields.io/github/license/Aditya-ds-1806/Skribblrs.io)](https://github.com/Aditya-ds-1806/Skribblrs.io/blob/main/LICENSE)

Skribblrs.io is my attempt at building a clone of the web-based drawing and guessing game [skribbl.io](https://skribbl.io).

To play a game: [https://skribblrs.herokuapp.com](https://skribblrs.herokuapp.com)

> It might take a couple of minutes to respond (I am on heroku free tier, so the app shuts down automatically if there is no activity.)

The site does not collect any user data or display ads.

## Local setup

The project requires Node.js to be installed on your system. To run the project locally:

```bash
git clone https://github.com/Aditya-ds-1806/Skribblrs.io.git
cd Skribblrs.io
npm i
npm run start
```

The app will run by default on port 3000. Open your browser and go to [http://localhost:3000](http://localhost:3000).

## Screenshots

| ![Landing page][landing]  | ![Landing page][settings] |
|:-------------------------:|:-------------------------:|
|  ![Landing page][game]    |  ![Landing page][scores]  |

## Technologies used

1. Back End
    - [Node.js](https://github.com/nodejs/node)
    - [Socket.io](https://github.com/socketio/socket.io)
    - [Express](https://github.com/expressjs/express)
    - [Chance](https://github.com/chancejs/chancejs)
    - [Leven](https://github.com/sindresorhus/leven)
    - [Nanoid](https://github.com/ai/nanoid)

2. Front End
    - [Socket.io client](https://github.com/socketio/socket.io-client)
    - [EJS](https://github.com/mde/ejs)
    - [Animate.css](https://github.com/animate-css/animate.css)
    - [Howler.js](https://github.com/goldfire/howler.js)
    - [DiceBear Avatars](https://github.com/DiceBear/avatars)
    - [Bootstrap](https://github.com/twbs/bootstrap)
    - [Varnam Transliteration API](https://github.com/varnamproject)


## Credits

1. Background Image: [https://skribbl.io/res/background.png](https://skribbl.io/res/background.png)
2. Feature ideas: [https://github.com/scribble-rs/scribble.rs](https://github.com/scribble-rs/scribble.rs)
3. Sounds: [https://freesound.org/](https://freesound.org/)

## License

MIT License

Copyright (c) 2021 Aditya DS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[landing]: ./public/images/screenshots/landing.jpeg
[settings]: ./public/images/screenshots/settings.jpeg
[game]: ./public/images/screenshots/game.png
[scores]: ./public/images/screenshots/scores.jpeg
