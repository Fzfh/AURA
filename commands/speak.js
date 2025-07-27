const path = require('path');
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const { tmpdir } = require('os');

const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';
const MODEL_ID = 'eleven_multilingual_v2';

const API_KEYS = [
  process.env.SOUND_API_KEY,
  process.env.SOUND_API_KEY1,
  process.env.SOUND_API_KEY2,
  process.env.SOUND_API_KEY3,
  process.env.SOUND_API_KEY4,
  process.env.SOUND_API_KEY5
];

function getRandomFile(ext = '.mp3') {
  return `speak-aura-${Date.now()}${ext}`;
}

async function tryGenerateAudio(apiKey, text, filePath) {
  const response = await axios({
    method: 'post',
    url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    data: {
      text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    },
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve());
    writer.on('error', reject);
  });
}

module.exports = async function speak(sock, msg) {
  const sender = msg.key.remoteJid;
  const isGroup = sender.endsWith('@g.us');

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
  if (content?.trim().toLowerCase() === 'csp') {
    await sock.sendMessage(sender, {
      text: '🔍 Sedang cek semua API Key...\nTunggu sebentar yaa~',
    }, { quoted: msg });
  
    let result = `🧾 *Cek Sisa Credit (ElevenLabs)*\n\n`;
    for (let i = 0; i < API_KEYS.length; i++) {
      const key = API_KEYS[i];
      if (!key) continue;
  
      try {
        const res = await axios.get('https://api.elevenlabs.io/v1/user', {
          headers: { 'xi-api-key': key }
        });
  
        const { subscription, email } = res.data;
        const charsUsed = subscription.character_count || 0;
        const charsLimit = subscription.character_limit || 0;
        const remaining = charsLimit - charsUsed;
  
        result += `🧪 *API Key ke-${i + 1}*\n`;
        result += `📧 Email: ${email}\n`;
        result += `🔤 Digunakan: ${charsUsed} karakter\n`;
        result += `💰 Sisa: ${remaining} karakter\n`;
        result += `🧱 Limit: ${charsLimit} karakter\n\n`;
      } catch (err) {
        result += `⚠️ *API Key ke-${i + 1} gagal dicek:*\n`;
        result += `${err.response?.data?.message || err.message}\n\n`;
      }
    }
  
    return sock.sendMessage(sender, { text: result.trim() }, { quoted: msg });
  }

  if (!content || !content.trim().toLowerCase().startsWith('sp ')) {
    return sock.sendMessage(sender, {
      text: '🗣️ Format salah. Gunakan: sp <teks>\nContoh: sp Aku sayang kamu 💕',
    }, { quoted: msg });
  }

  const text = content.trim().slice(3);
  const fileName = getRandomFile('.mp3');
  const filePath = path.join(tmpdir(), fileName);

  await sock.sendMessage(sender, {
    text: '🔊 Lagi ngubah teks jadi suara... tungguin yaa~',
  }, { quoted: msg });

  let success = false;
  for (let i = 0; i < API_KEYS.length; i++) {
    const apiKey = API_KEYS[i];
    try {
      await tryGenerateAudio(apiKey, text, filePath);
      success = true;
      break;
    } catch (err) {
      console.warn(`⚠️ Gagal pakai API Key ke-${i+1}:`, err.response?.data || err.message);
    }
  }

  if (!success) {
    return sock.sendMessage(sender, {
      text: '🚫 Gagal ambil suara dari semua API. Coba lagi nanti ya 🥺',
    }, { quoted: msg });
  }

  try {
    const audioBuffer = fs.readFileSync(filePath);
    await sock.sendMessage(sender, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: msg });
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error('❌ Gagal kirim audio:', err);
    await sock.sendMessage(sender, {
      text: '⚠️ Gagal kirim audio, coba lagi ya.',
    }, { quoted: msg });
  }
};
