const axios = require('axios');

async function downloadInstagram(url) {
  try {
    const res = await axios.get(`https://api.saveig.app/api/ajaxSearch`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0',
      },
      params: { q: url }
    });

    const data = res.data;

    if (!data || !data.medias || data.medias.length === 0) {
      throw new Error('Tidak ada media yang ditemukan.');
    }

    return {
      videoUrl: data.medias[0].url,
      all: data
    };

  } catch (err) {
    console.error('IG Downloader Error:', err.message || err);
    return null;
  }
}
module.exports = downloadInstagram;
