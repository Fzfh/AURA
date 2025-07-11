const fs = require('fs');
const { exec } = require('child_process');

async function downloadYtToMp3(url, outputPath) {
  return new Promise((resolve, reject) => {
    const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 --no-playlist --no-check-certificate --limit-rate 500K -o "${outputPath}" "${url}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ YTDLP ERROR:', stderr || error.message);
        reject(new Error('❌ Gagal convert MP3. Coba link lain ya~'));
        return;
      }

      if (!fs.existsSync(outputPath)) {
        return reject(new Error('❌ File MP3 tidak ditemukan setelah convert.'));
      }

      resolve();
    });
  });
}

module.exports = downloadYtToMp3;
