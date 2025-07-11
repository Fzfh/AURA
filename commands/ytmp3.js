const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadYtToMp3(url, savePath) {
  try {
    const { data } = await axios.get(`https://yt.tio.my.id/api/ytmp3?url=${encodeURIComponent(url)}`);

    if (!data.status || !data.result?.url) {
      throw new Error('⚠️ Gagal ambil audio. Coba link lain ya~');
    }

    const audioUrl = data.result.url;

    const writer = fs.createWriteStream(savePath);
    const response = await axios.get(audioUrl, { responseType: 'stream' });
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (err) {
    console.error('❌ Gagal download via API:', err);
    throw new Error('❌ Gagal ambil MP3. Link-nya mungkin error.');
  }
}

module.exports = downloadYtToMp3;
