const axios = require('axios');

function cleanInstagramUrl(url) {
  try {
    let cleaned = url.trim();

    // Hapus parameter setelah tanda tanya
    cleaned = cleaned.split('?')[0];

    // Hapus trailing slash
    if (cleaned.endsWith('/')) {
      cleaned = cleaned.slice(0, -1);
    }

    return cleaned;
  } catch {
    return url; 
  }
}

async function downloadInstagram(url) {
  try {
    const cleanedUrl = cleanInstagramUrl(url);

    const response = await axios.get(`https://instavideodownloader-com.onrender.com/api/video?postUrl=${encodeURIComponent(cleanedUrl)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
    });

    const data = response.data;

    if (data.status !== 'success' || !data.data.videoUrl) {
      throw new Error(data.message || 'Video tidak ditemukan');
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
