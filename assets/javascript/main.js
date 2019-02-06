document.addEventListener("DOMContentLoaded", function () {
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


  const handlePlayButton = (audioEl, buttonEl) => {
    // check if context is in suspended state (autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    // play or pause track depending on state
    if (buttonEl.dataset.playing === 'false') {
      audioEl.play();
      buttonEl.dataset.playing = 'true';
    } else if (buttonEl.dataset.playing === 'true') {
      audioEl.pause();
      buttonEl.dataset.playing = 'false';
    }
  };

  playButton1.addEventListener('click', function() {handlePlayButton(audioElement1, playButton1)}, false);
  playButton2.addEventListener('click', function() {handlePlayButton(audioElement2, playButton2)}, false);



});