const axios = require('axios');

async function downloadInstagram(url) {
  try {
    const response = await axios.post('https://igdl.red/api/instagram', {
      url: url
    });

    const data = response.data;

    if (!data || !data.success || !data.data || !data.data.url[0]) {
      throw new Error('Gagal mendapatkan video.');
    }

    return {
      videoUrl: data.data.url[0].url,
      musicUrl: null,
      all: {
        thumbnail: data.data.thumbnail,
        desc: data.data.description || '',
      }
    };

  } catch (err) {
    console.error('IG Downloader Error:', err.message || err);
    return null;
  }
}

module.exports = downloadInstagram;
