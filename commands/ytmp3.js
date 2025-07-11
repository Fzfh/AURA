const fs = require('fs');
const path = require('path');
const ytdlp = require('yt-dlp-exec');

async function downloadYtToMp3(url, outputPath) {
  try {
    await ytdlp(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: '0',
      output: outputPath,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 Safari/537.36',
      noCheckCertificate: true,
      preferFreeFormats: true,
      geoBypass: true,
      embedThumbnail: true,
      quiet: true,
    });
  } catch (err) {
    console.error('❌ Gagal download MP3:', err.stderr || err.message);
    throw new Error('Gagal download MP3! Coba video lain ya~');
  }
}

module.exports = downloadYtToMp3;
