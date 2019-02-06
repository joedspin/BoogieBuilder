const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const audioElement1 = document.getElementById('audio1');
const audioElement2 = document.getElementById('audio2');

const track1 = audioContext.createMediaElementSource(audioElement1);
const track2 = audioContext.createMediaElementSource(audioElement2);

track1.connect(audioContext.destination);
track2.connect(audioContext.destination);

const playButton1 = document.getElementById('button1');
const playButton2 = document.getElementById('button2');

playButton1.addEventListener('click', function () {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  if (this.dataset.playing === "false") {
    audioElement1.play();
    this.dataset.playing = "true";
  }
  if (this.dataset.playing === "true") {
    audioElement1.pause();
    this.dataset.playing = "false";
  }
}, false);

