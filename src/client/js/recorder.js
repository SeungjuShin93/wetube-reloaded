import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
const startBtn = document.getElementById('startBtn');
const video = document.getElementById('preview');

let stream;
let recorder;
let videoFile;

const handleDownload = async () => {
  const ffmpeg = new FFmpeg();
  await ffmpeg.load();

  ffmpeg.on('log', ({ type, message }) => console.log(message));

  ffmpeg.writeFile('recording.webm', await fetchFile(videoFile));

  await ffmpeg.exec(['-i', 'recording.webm', '-r', '60', 'output.mp4']);

  await ffmpeg.exec([
    '-i',
    'recording.webm',
    '-ss',
    '00:00:01',
    '-frames:v',
    '1',
    'thumbnail.jpg',
  ]);

  const mp4File = await ffmpeg.readFile('output.mp4');
  const thumbFile = await ffmpeg.readFile('thumbnail.jpg');

  const mp4Blob = new Blob([mp4File.buffer], { type: 'video/mp4' });
  const thumbBlob = new Blob([thumbFile.buffer], { type: 'image/jpg' });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  const a = document.createElement('a');
  a.href = mp4Url;
  a.download = 'MyRecording.mp4';
  document.body.appendChild(a);
  a.click();

  const thumbA = document.createElement('a');
  thumbA.href = thumbUrl;
  thumbA.download = 'MyThumbnail.jpg';
  document.body.appendChild(thumbA);
  thumbA.click();
};

const handleStop = () => {
  startBtn.innerText = 'Download Recording';
  startBtn.removeEventListener('click', handleStop);
  startBtn.addEventListener('click', handleDownload);
  recorder.stop();
};

const handleStart = () => {
  startBtn.innerText = 'Stop Recording';
  startBtn.removeEventListener('click', handleStart);
  startBtn.addEventListener('click', handleStop);
  recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    console.log(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener('click', handleStart);
