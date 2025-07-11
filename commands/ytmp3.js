const axios = require('axios');
const fs = require('fs');

async function downloadYtToMp3(url, outputPath) {
  try {
    const encodedUrl = encodeURIComponent(url);
    const res = await axios.get(`https://vidfetch.my.id/api/ytmp3?url=${encodedUrl}`);

    if (!res.data.status || !res.data.result?.url) {
      throw new Error('Audio tidak ditemukan!');
    }

    const audioUrl = res.data.result.url;
    const writer = fs.createWriteStream(outputPath);
    const audioRes = await axios.get(audioUrl, { responseType: 'stream' });

    audioRes.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (err) {
    console.error('❌ Gagal download via API:', err);
    throw new Error('❌ Gagal ambil MP3. Coba link lain yaa!');
  }
}

module.exports = downloadYtToMp3;
