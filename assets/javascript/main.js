let canvas = '';
let ctx = '';
let title = '';
let AudioContext = '';
let audioContext = '';
let interval = '';
let info = '';
let globalShift = '';
let dataArray = '';
let driftingCircles = [];
let messageMove = 300;
let playButton1 = '';
let modeButton1 = '';
const slices = new Array(12);

const COLORS = [
  "white",
  "rgb(249, 54, 31)",
  "rgb(66, 79, 142)",
  "rgb(105, 73, 118)",
  "rgb(185, 62, 69)",
  "rgb(50, 9, 100)",
  "rgb(190, 194, 206)",
  "gold",
  "hotpink",
  "rgb(50,8,100)"
];
const COLOR_SELECTOR = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];
const INSTR_SELECTOR = ['guitar','guitar','guitar',
                        'drum','drum','drum',
                        'string','string','string',
                        'bass','bass','bass','bass'];
const THEMES = ['default','red'];
const THEME_NAMES = ['Freak Mode','Beep Mode'];
let currentTheme = THEMES[0];

class Slice {
  constructor() {
    this.audio = '';
    this.button = '';
    this.color = '';
    this.track = '';
    this.analyser = '';
    this.dataArray = [];
  }

  toggle() {
    if (this.audio.muted) {
      this.audio.muted = false;
      this.button.classList.add('unmute');
    } else {
      this.audio.muted = true;
      this.button.classList.remove('unmute');
    }
  }

  analyze() {
    this.analyser.getByteFrequencyData(this.dataArray);
  }

  playing() {
    return !this.audio.muted;
  }

  finished() {
    return this.audio.currentTime === this.audio.duration;
  }
}

class driftingCircle {
  constructor(startX, startY, size, color) {
    this.x = startX;
    this.y = startY;
    this.size = size;
    this.color = color;
  }

  drift() {
    this.y -= 40;
    let xMove = Math.floor(Math.random()*3);
    if (Math.floor(Math.random()*2) === 1) {
      this.x += xMove;
    } else {
      this.x -= xMove;
    }
    this.size = (this.size * 1.24);
  }

  draw() {
    drawCircle(this.x, this.y, this.size / 2, this.color);
  }

}

function startAudio() {
  for (let i = 0; i < 12; i++) {
    slices[i].track = audioContext.createMediaElementSource(slices[i].audio);
    slices[i].track.connect(audioContext.destination);
    slices[i].analyser = audioContext.createAnalyser();
    slices[i].track.connect(slices[i].analyser);
    slices[i].analyser.fftSize = 1024;
    slices[i].dataArray = new Uint8Array(slices[i].analyser.frequencyBinCount);
  }
  document.removeEventListener('click', startAudio);
}

function attachSlices() {
  for (let i = 0; i < 12; i++) {
    slices[i] = new Slice();
    slices[i].audio = document.getElementById(`audio${i}`);
    slices[i].button = document.getElementById(`slice${i}`);
    slices[i].color = COLORS[COLOR_SELECTOR[i]];
    slices[i].button.addEventListener('click', function () { slices[i].toggle() }, false)
  }
}

function drawCircle(x, y, ballRadius, color) {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2, false);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.4;
  ctx.shadowColor = "white";
  ctx.fill();
  ctx.closePath();
}

function drawBar(x, y, w) {
  ctx.beginPath();
  ctx.rect(x, y, w, 20);
  // ctx.fillStyle = "rgb(249, 54, 31)";
  let gradient = ctx.createLinearGradient(0, 0, 600, 0);
  gradient.addColorStop("0", "rgb(255, 51, 0)");
  gradient.addColorStop("1.0", "rgb(23, 81, 168)");
  ctx.fillStyle = gradient;
  ctx.globalAlpha = 1;
  ctx.fill();
}

function drawMessage() {
  ctx.font = "24px 'Fugaz One'";
  let gradient = ctx.createLinearGradient(0, 0, 600, 0);
  gradient.addColorStop("0", "rgb(255, 51, 0)");
  gradient.addColorStop("1.0", "rgb(23, 81, 168)");
  ctx.fillStyle = gradient;
  ctx.globalAlpha = 1;
  ctx.fillText("The magic starts when you click on an instrument below . . .", messageMove, canvas.height / 2); 
  messageMove -= 1;
  if (messageMove < -700) messageMove = 600;
}

function drawTimer() {
  // also includes logic to restart the loop
  let ct = slices[1].audio.currentTime;
  let du = slices[1].audio.duration;
  let size = ct / du * 600;
  drawBar(300 - (size / 2), 380, size);
  if (ct === du) {
    // don't restart until all the audios have finished!
    let othersFinished = false;
    let infinityProtection = 50000;
    while (!othersFinished && infinityProtection > 0) {
      for (let i = 1; i < 12; i++) {
        othersFinished = true;
        if (!slices[i].finished()) { 
          othersFinished = false; 
          if (!slices[i].playing()) {
            slices[i].audio.play();
          }
        }
      }
      infinityProtection --;
    }
    for (let i = 0; i < 12; i++) {
      slices[i].audio.play();
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let nothingPlaying = true;
  for (let i = 0; i < 12; i++) {
    if (slices[i].playing()) {
      nothingPlaying = false;
      slices[i].analyze();
      let a = slices[i].dataArray;
      let w = a.length;
      let size = 0;
      let color = slices[i].color
      for (let j = 30; j < w; j += 250) {
        size = 50 * (a[j] / Math.max.apply(null, a));
        let randChoice = Math.floor(Math.random() * 6);
        if (randChoice === 3) { color = COLORS[Math.floor(Math.random()*8)]; }
        driftingCircles.push(new driftingCircle((i * 40) + 80, 370, size, color));
        driftingCircles.forEach((circle) => {
          circle.draw();
          circle.drift();
        });
      }
    }
    driftingCircles = driftingCircles.filter(circle => circle.y > 80 && circle.size < 150);
  }
  drawTimer();
  if (nothingPlaying) { drawMessage(); }
}

function addButtons(theme) {
  // theme should be 'default' or 'red' is the only other theme for now
  let mixpad = document.getElementById("mixpad");
  let button = '';
  for (let i = 0; i < 12; i++) {
    button = document.createElement("BUTTON");
    button.id = `slice${i}`;
    let num = COLOR_SELECTOR[i];
    if (theme !== "default" && i < 3) num += 4;
    button.className = `mixpad${num}`;
    button.dataPlaying = "false";
    mixpad.appendChild(button);
  }
  if (theme === "default") {
    document.getElementById("button1").style.backgroundColor = `${COLORS[4]}`;
    document.getElementById("button2").style.backgroundColor = `${COLORS[4]}`;
  } else {
    document.getElementById("button1").style.backgroundColor = `${COLORS[3]}`;
    document.getElementById("button2").style.backgroundColor = `${COLORS[3]}`;
  }
  let bodyElement = document.querySelector("body");
  bodyElement.style.backgroundColor = `${COLORS[9]}`;
  canvas.style.backgroundImage = `url('./assets/images/boogie-background${theme !== 'default' ? `-${theme}` : ''}.png')`;
  title.className = `title-${theme}`;
}

function removeButtons() {
  var button = '';
  for (let i = 0; i < 12; i++) {
    button = document.querySelector(`button#slice${i}`);
    button.parentNode.removeChild(button);
  }
}

function addAudios(theme) {
  // theme should be empty string for default. 'red' is the only other theme for now
  let audio = '';
  for (let i = 0; i < 12; i++) {
    audio = document.createElement("AUDIO");
    audio.id = `audio${i}`;
    audio.muted = true;
    audio.src = `assets/audios/${INSTR_SELECTOR[i]}${(i % 3) + 1}${theme !== 'default' ? `-${theme}` : ''}.mp3`;
    audio.setAttribute('type', 'audio/mpeg');
    audio.muted = true;
    canvas.appendChild(audio);
  }
}

function removeAudios() {
  var audio = '';
  for (let i = 0; i < 12; i++) {
    audio = document.querySelector(`audio#audio${i}`);
    audio.parentNode.removeChild(audio);
  }
}

function handlePlayButton() {
  // if audio context state is suspended, resume it
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  // play or pause track depending on state and flip state
  if (playButton1.dataset.playing === 'false') {
    for (let i = 0; i < 12; i++) {
      slices[i].audio.play();
    }
    playButton1.dataset.playing = 'true';
    playButton1.innerHTML = 'Pause';
    interval = setInterval(draw, 10);
  } else if (playButton1.dataset.playing === 'true') {
    for (let i = 0; i < 12; i++) {
      slices[i].audio.pause();
    }
    playButton1.dataset.playing = 'false';
    playButton1.innerHTML = 'Play';
    let infinityProtection = 5000;
    while (driftingCircles.length > 0 && infinityProtection > 0) {
      driftingCircles.pop();
      infinityProtection --;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clearInterval(interval);
  }
}

function handleModeButton() {
    for (let i = 0; i < 12; i++) {
      slices[i].audio.pause();
    }
    let infinityProtection = 5000;
    while (driftingCircles.length > 0 && infinityProtection > 0) {
      driftingCircles.pop();
      infinityProtection--;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clearInterval(interval);
    for (let i = 0; i < 12; i++) {
      slices[i].button.removeEventListener('click', function () { slices[i].toggle() }, false);
      slices[i] = '';
    }
    removeButtons();
    removeAudios();
    let other = THEMES[1];
    THEMES[1] = THEMES[0];
    THEMES[0] = other;
    other = THEME_NAMES[1];
    THEME_NAMES[1] = THEME_NAMES[0];
    THEME_NAMES[0] = other;
    other = COLORS[9];
    COLORS[9] = COLORS[1];
    COLORS[1] = other;
    addAudios(THEMES[0]);
    addButtons(THEMES[0]);
    attachSlices();
    modeButton1.innerHTML = THEME_NAMES[1];
    startAudio();
  if (playButton1.dataset.playing = 'true') {
    for (let i = 0; i < 12; i++) {
      slices[i].audio.play();
    }
    interval = setInterval(draw, 10);
  }
}

function keyboardAction(e) {
  if (e.keyCode === 62) {
    handlePlayButton(playButton1);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  AudioContext = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioContext();

  addAudios(THEMES[0]);
  addButtons(THEMES[0]);
  attachSlices();

  title = document.getElementById('title');
  info = document.getElementById('info');
  playButton1 = document.getElementById('button1');
  modeButton1 = document.getElementById('button2');

  document.addEventListener('click', startAudio);
  document.addEventListener('keydown', keyboardAction);
  playButton1.addEventListener('click', function() {handlePlayButton();}, false);
  modeButton1.addEventListener('click', function () { handleModeButton(); }, false);
});