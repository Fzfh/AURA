require('dotenv').config({ path: __dirname + '/.env' })
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');

// API & Voice ID
const API_KEY = process.env.SOUND_API_KEY;
const VOICE_ID = 'MF3mGyEYCl7XYWbV9V6O'; // ELLI INI

function getRandomFile(ext = '.mp3') {
  return `speak-aura-${Date.now()}${ext}`;
}

module.exports = async function speak(sock, msg) {
  const sender = msg.key.remoteJid;

  // ✅ CEK JENIS CHAT (grup / pribadi)
  const isGroup = sender.endsWith('@g.us');

  // ✅ CEK ADMIN JIKA DI GRUP
  if (isGroup) {
    const metadata = await sock.groupMetadata(sender);
    const participants = metadata.participants || [];
    const senderId = msg.participant || msg.key.participant || msg.key.remoteJid;
    const isAdmin = participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));

    if (!isAdmin) {
      return sock.sendMessage(sender, {
        text: '❌ Maaf, fitur ini cuma bisa dipakai oleh admin grup ya~',
      }, { quoted: msg });
    }
  }

  const content = msg.message?.conversation ||
                  msg.message?.extendedTextMessage?.text ||
                  msg.message?.imageMessage?.caption ||
                  msg.message?.videoMessage?.caption;
  
  if (!content || !content.trim().toLowerCase().startsWith('sp ')) {
    return sock.sendMessage(sender, {
      text: '🗣️ Format salah. Gunakan: sp <teks>\nContoh: sp Aku sayang kamu 💕',
    }, { quoted: msg });
  }

  const text = content.trim().slice(3); // hapus 'sp '

  const fileName = getRandomFile('.mp3');
  const filePath = path.join(tmpdir(), fileName);

  try {
    await sock.sendMessage(sender, {
      text: '🔊 Sedang Generate suara dari teks kamu....',
    }, { quoted: msg });

    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        text,
        model_id: 'eleven_multilingual_v2',
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
      const audioBuffer = fs.readFileSync(filePath);

      await sock.sendMessage(sender, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false
      }, { quoted: msg });

      fs.unlinkSync(filePath);
    });

    writer.on('error', async (err) => {
      console.error('❌ Gagal simpan audio:', err);
      await sock.sendMessage(sender, {
        text: '⚠️ Gagal simpan audio, coba lagi ya.',
      }, { quoted: msg });
    });

  } catch (err) {
    console.error('❌ Error dari ElevenLabs:', err.response?.data || err.message);
    await sock.sendMessage(sender, {
      text: '🚫 Gagal ambil suara dari ElevenLabs. Cek API key & koneksi ya.',
    }, { quoted: msg });
  }
};
