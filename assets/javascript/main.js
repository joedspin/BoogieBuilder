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
  "hotpink"
];
const COLOR_SELECTOR = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];

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
  AudioContext = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioContext();
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
  ctx.rect(x, y, w, 10);
  ctx.fillStyle = "rgb(249, 54, 31)";
  ctx.globalAlpha = 1;
  ctx.fill();
}

function drawMessage() {
  ctx.font = "24px 'Fugaz One'";
  let gradient = ctx.createLinearGradient(0, 0, 600, 0);
  gradient.addColorStop("0", "rgb(255, 51, 0)");
  gradient.addColorStop("1.0", "rgb(23, 81, 168)");
  ctx.fillStyle = gradient;
  ctx.fillText("The magic starts when you click on an instrument below . . .", messageMove, canvas.height / 2); 
  messageMove -= 1;
  if (messageMove < -700) messageMove = 600;
}

function drawTimer() {
  let ct = slices[1].audio.currentTime;
  let du = slices[1].audio.duration;
  let size = ct / du * 600;
  drawBar(300 - (size / 2), 390, size);
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
        driftingCircles.push(new driftingCircle((i * 40) + 80, 380, size, color));
        driftingCircles.forEach((circle) => {
          circle.draw();
          circle.drift();
        });
      }
    }
    driftingCircles = driftingCircles.filter(circle => circle.y > 80 && circle.size < 150);
  }
  if (nothingPlaying) { drawMessage(); }
  drawTimer();
}

function handlePlayButton(buttonEl) {
  // if audio context state is suspended, resume it
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  // play or pause track depending on state and flip state
  if (buttonEl.dataset.playing === 'false') {
    for (let i = 0; i < 12; i++) {
      slices[i].audio.play();
    }
    buttonEl.dataset.playing = 'true';
    buttonEl.innerHTML = 'Pause';
    interval = setInterval(draw, 10);
  } else if (buttonEl.dataset.playing === 'true') {
    for (let i = 0; i < 12; i++) {
      slices[i].audio.pause();
    }
    buttonEl.dataset.playing = 'false';
    buttonEl.innerHTML = 'Play';
    let infinityProtection = 5000;
    while (driftingCircles.length > 0 && infinityProtection > 0) {
      driftingCircles.pop();
      infinityProtection --;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clearInterval(interval);
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

  title = document.getElementById('title');
  for (let i = 0; i < 12; i++) {
    slices[i] = new Slice();
    slices[i].audio = document.getElementById(`audio${i}`);
    slices[i].button = document.getElementById(`slice${i}`);
    slices[i].color = COLORS[COLOR_SELECTOR[i]];
    slices[i].button.addEventListener('click', function() {slices[i].toggle()}, false)
  }
  info = document.getElementById('info');
  const playButton1 = document.getElementById('button1');

  document.addEventListener('click', startAudio);
  document.addEventListener('keydown', keyboardAction);
  playButton1.addEventListener('click', function() {handlePlayButton(playButton1);}, false);


});