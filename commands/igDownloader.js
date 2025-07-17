async function downloadInstagram(rawInput) {
  try {
    console.log('🧪 Received IG URL:', rawInput, '| Type:', typeof rawInput);

    const extractedUrl = extractInstagramUrl(rawInput);

    if (!extractedUrl) throw new Error('URL Instagram tidak valid');

    const response = await axios.get("https://instavideodownloader-com.onrender.com/api/video", {
      params: { postUrl: extractedUrl },
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

function extractInstagramUrl(input) {
  if (typeof input === 'string') return input;

  const json = JSON.stringify(input);
  const match = json.match(/https:\/\/www\.instagram\.com\/(reel|p|tv)\/[a-zA-Z0-9_\-]+/);
  return match ? match[0] : null;
}

module.exports = downloadInstagram;
