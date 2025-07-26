const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 🔐 Ganti dengan API Key ElevenLabs kamu
const API_KEY = 'sk_0ea6a643a6051826cf88c402e7752ad36d542c667b1e5a9f'; // Jangan bocorin full di publik ya 😘
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Rachel - default

function getRandom(ext = '.mp3') {
  return `${Math.floor(Math.random() * 100000)}${ext}`;
}

module.exports = {
  name: 'speak',
  aliases: ['say', 'bisik', 'suara'],
  category: 'fun',
  desc: 'Ubah teks jadi suara cewek manja via ElevenLabs ✨',
  async handler(m, { sock, text }) {
    const reply = (msg) => sock.sendMessage(m.chat, { text: msg }, { quoted: m });

    if (!text) return reply('🗣️ Teksnya mana, sayang? Contoh: .speak Aku kangen kamu 💞');

    const fileName = getRandom('.mp3');
    const filePath = path.join(__dirname, '../tmp', fileName);

    try {
      const response = await axios({
        method: 'post',
        url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        data: {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        },
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on('finish', async () => {
        await sock.sendMessage(m.chat, {
          audio: fs.readFileSync(filePath),
          mimetype: 'audio/mpeg',
          ptt: false
        }, { quoted: m });

        fs.unlinkSync(filePath); // bersihkan setelah kirim
      });

      writer.on('error', err => {
        console.error('❌ Error simpan audio:', err);
        reply('⚠️ Gagal simpan audio, coba lagi yaa.');
      });

    } catch (err) {
      console.error('❌ Error ElevenLabs:', err.response?.data || err.message);
      reply('🚫 Gagal hubungi ElevenLabs. Cek API Key dan koneksi kamu yaa~');
    }
  }
};
