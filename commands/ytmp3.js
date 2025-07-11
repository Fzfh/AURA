const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

async function downloadYtToMp3(url, outputPath) {
  return new Promise(async (resolve, reject) => {
    try {
      const info = await ytdl.getInfo(url);
      const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

      if (!audioFormat || !audioFormat.url) {
        return reject(new Error('❌ Format audio tidak ditemukan.'));
      }

      ffmpeg(ytdl.downloadFromInfo(info, { quality: 'highestaudio' }))
        .audioBitrate(128)
        .format('mp3')
        .on('error', err => {
          console.error('FFMPEG Error:', err);
          reject(new Error('❌ Gagal convert MP3.'));
        })
        .on('end', () => {
          resolve();
        })
        .save(outputPath);

    } catch (err) {
      console.error('❌ MP3 Error:', err);
      reject(new Error('❌ Gagal convert MP3. Link mungkin dibatasi YouTube.'));
    }
  });
}

module.exports = downloadYtToMp3;
