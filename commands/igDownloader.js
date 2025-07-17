async function downloadInstagram(url) {
  try {
    const trimmedUrl = String(url).trim();


    // Validasi URL
    if (!/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_\-\/?=]+/.test(trimmedUrl)) {
      throw new Error('URL Instagram tidak valid');
    }

    const response = await axios.get("https://instavideodownloader-com.onrender.com/api/video", {
      params: {
        postUrl: trimmedUrl
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
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
