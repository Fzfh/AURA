const axios = require('axios');

async function downloadInstagram(url) {
  try {
    const response = await axios.get(`https://instavideodownloader-com.onrender.com/api/video?postUrl=${encodeURIComponent(url)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
    });

    const data = response.data;

    if (data.status !== 'success' || !data.data.videoUrl) {
      throw new Error('Video tidak ditemukan');
    }

    return {
      videoUrl: data.data.videoUrl,
      musicUrl: null,
      all: data.data
    };
  } catch (err) {
    console.error('IG Downloader Error:', err.response?.data || err.message || err);
    return null;
  }
}

module.exports = downloadInstagram;
