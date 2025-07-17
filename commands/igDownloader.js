const axios = require('axios');

async function downloadInstagram(url, retry = 3) {
  while (retry--) {
    try {
      const res = await axios.get(`https://api.saveig.app/api/ajaxSearch`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Mozilla/5.0',
        },
        params: { q: url },
        timeout: 7000 // agar gak nunggu lama
      });

      const data = res.data;
      if (!data || !data.medias || data.medias.length === 0)
        throw new Error('Tidak ada media yang ditemukan.');

      return {
        videoUrl: data.medias[0].url,
        all: data
      };
    } catch (err) {
      console.error('⚠️ IG Downloader Error:', err.message || err);
      await new Promise(resolve => setTimeout(resolve, 1500)); // tunggu 1.5 detik
    }
  }

  return null;
}

module.exports = downloadInstagram;
