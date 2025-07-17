const axios = require('axios');

function extractInstagramPath(url) {
  try {
    const trimmedUrl = url.trim();
    if (!/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_\-\/?=]+/.test(trimmedUrl)) {
      return null;
    }

    const u = new URL(trimmedUrl);
    let pathname = u.pathname;

    // pastikan tanpa trailing slash
    if (pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    return pathname;
  } catch (err) {
    return null;
  }
}


async function downloadInstagram(url) {
  try {
    const postPath = extractInstagramPath(url);
    if (!postPath) throw new Error('URL Instagram tidak valid');

    const response = await axios.get(`https://instavideodownloader-com.onrender.com/api/video?postUrl=${encodeURIComponent(postPath)}`, {
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
      console.log('[DEBUG] Raw URL:', url);
      musicUrl: null,
      all: data.data
    };
  } catch (err) {
    console.error('IG Downloader Error:', err.response?.data || err.message || err);
    return null;
  }
}

module.exports = downloadInstagram;
