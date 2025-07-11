const { execFile } = require('child_process');
const ytdlp = require('yt-dlp-exec');

async function downloadYtToMp3(url, outputPath) {
  await ytdlp(url, {
    extractAudio: true,
    audioFormat: 'mp3',
    audioQuality: '0',
    output: outputPath
  });
}
