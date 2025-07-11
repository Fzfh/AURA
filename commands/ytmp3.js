const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function downloadYtToMp3(url, outputPath) {
  try {
    const apiUrl = process.env.YTMP3_API;
    if (!apiUrl) throw new Error('API URL tidak ditemukan di .env');

    const { data } = await axios.get(`${apiUrl}&url=${encodeURIComponent(url)}`);
    if (!data || !data.result || !data.result.audioUrl) {
      throw new Error('Gagal ambil MP3 dari API');
    }

    const mp3Url = data.result.audioUrl;

    const writer = fs.createWriteStream(outputPath);
    const response = await axios.get(mp3Url, { responseType: 'stream' });
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    if (!fs.existsSync(outputPath)) {
      throw new Error('Gagal menghasilkan file');
    }

  } catch (err) {
    console.error('❌ MP3 Error:', err);
    throw new Error('❌ Gagal convert MP3. Link mungkin dibatasi YouTube.');
  }
}

module.exports = downloadYtToMp3;
