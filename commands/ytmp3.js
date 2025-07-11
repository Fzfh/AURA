const ytdlp = require('yt-dlp-exec');
const { escape } = require('shell-escape');
const fs = require('fs');

async function downloadYtToMp3(url, outputPath) {
  try {
    await ytdlp([
      url,
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      '--output', outputPath,
      '--no-check-certificate',
      '--no-playlist',
      '--limit-rate', '500K',
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    ], { shell: true });

    if (!fs.existsSync(outputPath)) {
      throw new Error('Gagal menghasilkan file');
    }
  } catch (err) {
    console.error('❌ YTDLP ERROR:', err);
    throw new Error('Gagal convert MP3. Coba link lain ya~');
  }
}

module.exports = downloadYtToMp3;
