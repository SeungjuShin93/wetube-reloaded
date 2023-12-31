const video = document.querySelector('video');
const playBtn = document.getElementById('play');
const playBtnIcon = playBtn.querySelector('i');
const muteBtn = document.getElementById('mute');
const muteBtnIcon = muteBtn.querySelector('i');
const volumeRange = document.getElementById('volume');
const currentTime = document.getElementById('currentTime');
const totalTime = document.getElementById('totalTime');
const timeline = document.getElementById('timeline');
const fullScreenBtn = document.getElementById('fullScreen');
const fullScreenIcon = fullScreenBtn.querySelector('i');
const videoContainer = document.getElementById('videoContainer');
const videoControls = document.getElementById('videoControls');
const textarea = document.getElementById('comment');
let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const formatTime = (seconds) => {
  const startIdx = seconds >= 3600 ? 11 : 14;
  return new Date(seconds * 1000).toISOString().substring(startIdx, 19);
};
const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused
    ? 'fa-solid fa-play'
    : 'fa-solid fa-pause';
};

const handleVideoClickPlay = () => {
  handlePlayClick();
};

const handleMute = (e) => {
  if (video.muted) {
    video.muted = false;
    video.volume = volumeValue;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted
    ? 'fa-solid fa-volume-xmark'
    : 'fa-solid fa-volume-high';
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleInputVolumeRange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = 'Mute';
  }
  if (Number(value) === 0) {
    video.muted = true;
    muteBtn.innerText = 'Unmute';
  }
  video.volume = value;
};

const handleChangeVolumeRange = (event) => {
  const {
    target: { value },
  } = event;
  if (Number(value) !== 0) {
    volumeValue = value;
  }
};

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullScreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = 'fa-solid fa-expand';
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = 'fa-solid fa-compress';
  }
};

const hideControls = () => videoControls.classList.remove('showing');

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add('showing');
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 3000);
};
const handleKeyboard = (event) => {
  const keyBoardInput = event.key;
  if (event.target === textarea) {
    return;
  }
  if (keyBoardInput === ' ') {
    event.preventDefault();
    return handlePlayClick();
  }
  if (
    keyBoardInput === 'Enter' ||
    keyBoardInput === 'f' ||
    keyBoardInput === 'F'
  ) {
    return handleFullScreen();
  }
  if (keyBoardInput === 'm' || keyBoardInput === 'M') {
    return handleMute();
  }
  if (keyBoardInput === 'ArrowRight') {
    return (video.currentTime += 5);
  }
  if (keyBoardInput === 'ArrowLeft') {
    return (video.currentTime -= 5);
  }
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: 'POST',
  });
};

playBtn.addEventListener('click', handlePlayClick);
muteBtn.addEventListener('click', handleMute);
volumeRange.addEventListener('input', handleInputVolumeRange);
volumeRange.addEventListener('change', handleChangeVolumeRange);
video.addEventListener('loadedmetadata', handleLoadedMetadata);
video.addEventListener('timeupdate', handleTimeUpdate);
video.addEventListener('click', handleVideoClickPlay);
video.addEventListener('ended', handleEnded);
timeline.addEventListener('input', handleTimelineChange);
fullScreenBtn.addEventListener('click', handleFullScreen);
videoContainer.addEventListener('mousemove', handleMouseMove);
videoContainer.addEventListener('mouseleave', handleMouseLeave);
window.addEventListener('keydown', handleKeyboard);
if (!isNaN(video.duration)) {
  handleLoadedMetadata();
}
