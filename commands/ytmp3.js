const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const path = require('path');
ffmpeg.setFfmpegPath(ffmpegPath);

async function downloadYtToMp3(url, outputPath) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!ytdl.validateURL(url)) return reject(new Error('❌ URL YouTube tidak valid'));

      const videoPath = path.join('/tmp', `vid-${Date.now()}.mp4`);
      const audioStream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });

      // Step 1: Simpan dulu audio ke file sementara
      const writeStream = fs.createWriteStream(videoPath);
      audioStream.pipe(writeStream);

      writeStream.on('finish', () => {
        // Step 2: Konversi ke MP3 setelah selesai simpan
        ffmpeg(videoPath)
          .audioBitrate(128)
          .format('mp3')
          .save(outputPath)
          .on('end', () => {
            fs.unlinkSync(videoPath); // hapus file sementara
            if (fs.existsSync(outputPath)) resolve();
            else reject(new Error('❌ Gagal membuat file MP3'));
          })
          .on('error', err => {
            console.error('❌ FFMPEG ERROR:', err);
            reject(new Error('❌ Gagal convert MP3. Coba lagi'));
          });
      });

      writeStream.on('error', err => {
        console.error('❌ STREAM ERROR:', err);
        reject(new Error('❌ Gagal mendownload audio YouTube'));
      });

    } catch (err) {
      reject(err);
    }
  });
}

module.exports = downloadYtToMp3;
