const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

async function downloadYtToMp3(url, outputPath) {
  return new Promise((resolve, reject) => {
    if (!ytdl.validateURL(url))
      return reject(new Error('❌ URL YouTube tidak valid'));

    const audioStream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
    const proc = ffmpeg(audioStream)
      .audioBitrate(128)
      .format('mp3')
      .save(outputPath)
      .on('end', () => {
        if (fs.existsSync(outputPath)) resolve();
        else reject(new Error('❌ Gagal membuat file MP3'));
      })
      .on('error', err => {
        console.error('❌ FFMPEG ERROR:', err);
        reject(new Error('❌ Gagal convert MP3. Coba lagi'));
      });
  });
}

module.exports = downloadYtToMp3;
