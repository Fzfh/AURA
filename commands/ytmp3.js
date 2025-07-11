const fs = require('fs');
const ytdl = require('ytdl-core');
const { exec } = require('child_process');
const path = require('path');

async function downloadYtToMp3(url, outputPath) {
  try {
    const tempStream = path.join('/tmp', `audio_${Date.now()}.mp4`);

    await new Promise((resolve, reject) => {
      const stream = ytdl(url, { quality: 'highestaudio' });
      const file = fs.createWriteStream(tempStream);
      stream.pipe(file);
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    await new Promise((resolve, reject) => {
      exec(`ffmpeg -i ${tempStream} -vn -ab 128k -ar 44100 -y ${outputPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(stderr);
          return reject('Gagal convert MP3.');
        }
        resolve();
      });
    });

    fs.unlinkSync(tempStream);
  } catch (err) {
    console.error('❌ MP3 Error:', err);
    throw new Error('Gagal convert MP3. Coba link lain ya~');
  }
}

module.exports = downloadYtToMp3;
