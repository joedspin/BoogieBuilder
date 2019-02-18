let canvas = '';
let ctx = '';
let title = '';
let AudioContext = '';
let audioContext = '';
let interval = '';
let info = '';
let scene = '';
let camera = '';
let renderer = '';
let cube = '';
let line = '';
let geometry = '';
let material = '';
let globalShift = '';
let dataArray = '';
let driftingCircles = [];
const slices = new Array(12);

const COLORS = [
  "hotpink",
  "rgb(249, 54, 31)",
  "rgb(66, 79, 142)",
  "rgb(105, 73, 118)",
  "rgb(185, 62, 69)",
  "rgb(50, 9, 100)",
  "rgb(190, 194, 206)",
  "gold"
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
    // let xMove = Math.floor(Math.random()*3);
    // if (Math.floor(Math.random()*2) === 1) {
    //   this.x += xMove;
    // } else {
    //   this.x -= xMove;
    // }
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
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.shadowBlur = 1;
  ctx.fill();
  ctx.closePath();
}

function drawBar(x, y, w) {
  ctx.beginPath();
  ctx.rect(x, y, w, 5);
  ctx.fillStyle = "rgb(249,54,31";
  ctx.globalAlpha = 1;
  ctx.fill();
}

  // for (let i = 1; i <= numOn; i++) {
  //   drawCircle(20 + (i * 30), 370, 10, "limegreen");
  // }

function drawTimer() {
  let ct = slices[1].audio.currentTime;
  let du = slices[1].audio.duration;
  let size = ct / du * 500;
  drawBar(250 - (size / 2), 395, size);
  if (ct === du) {
    for (let i = 0; i < 12; i++) {
      slices[i].audio.play();
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 12; i++) {
    if (slices[i].playing()) {
      slices[i].analyze();
      let a = slices[i].dataArray;
      let w = a.length;
      let size = 0;
      let color = slices[i].color
      for (let j = 30; j < w; j += 250) {
        size = 50 * (a[j] / Math.max.apply(null, a));
        let randChoice = Math.floor(Math.random() * 12);
        if (randChoice === 6) { color = COLORS[Math.floor(Math.random()*8)]; }
        console.log(randChoice);
        driftingCircles.push(new driftingCircle((i * 40) + 30, 390, size, color));
        driftingCircles.forEach((circle) => {
          circle.draw();
          circle.drift();
        });
        driftingCircles = driftingCircles.filter(circle => circle.y > 20);
      }
    }
  }
  drawTimer();
}

// function animate() {
//   requestAnimationFrame(animate);
//   cube.rotation.x += 0.01;
//   cube.rotation.y += 0.01;
//   line.rotation.x += 0.01;
//   line.rotation.y += 0.01;
//   renderer.render(scene, camera);
// }

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
    driftingCircles = [];
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

  // scene = new THREE.Scene();
  // camera = new THREE.PerspectiveCamera(75, 500 / 400, 0.1, 1000);
  // renderer = new THREE.WebGLRenderer();

  // renderer.setSize(window.innerWidth, window.innerHeight);
  // // document.body.appendChild(renderer.domElement);

  // geometry = new THREE.BoxGeometry(1, 1, 2);
  // material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  // cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);
  // material = new THREE.LineBasicMaterial({ color: 0x0000ff });
  // geometry = new THREE.Geometry();
  // geometry.vertices.push(new THREE.Vector3(-10, 0, 0));
  // geometry.vertices.push(new THREE.Vector3(0, 10, 0));
  // geometry.vertices.push(new THREE.Vector3(10, 0, 0));
  // line = new THREE.Line(geometry, material);
  // scene.add(line);
  // animate();

  // camera.position.z = 5;

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