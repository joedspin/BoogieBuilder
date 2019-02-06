const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

const audioElement1 = document.getElementById('audio1');
const audioElement2 = document.getElementById('audio2');
const track1 = audioContext.createMediaElementSource(audioElement1);
const track2 = audioContext.createMediaElementSource(audioElement2);s

track1.connect(audioContext.destination);
track2.connect(audioContext.destination);

const playButton1 = document.getElementById('button1');
const playButton2 = document.getElementById('button2');