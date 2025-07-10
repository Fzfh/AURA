const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = async function ekstrakAudio(sock, msg) {
  try {
    const sender = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const videoDirect = msg.message?.videoMessage;
    const videoReply = quoted?.videoMessage;

    const targetVideo = videoDirect || videoReply;
    if (!targetVideo) {
      return sock.sendMessage(sender, {
        text: '❌ Tidak ada video yang ditemukan.\nKirim video dengan caption "ets" atau reply video dan ketik "ets".',
      }, { quoted: msg });
    }

    await sock.sendMessage(sender, {
      text: '🔄 Sedang mengekstrak audio...',
    }, { quoted: msg });

    const tempDir = tmpdir();
    const videoPath = path.join(tempDir, `vid-${uuidv4()}.mp4`);
    const audioPath = path.join(tempDir, `aud-${uuidv4()}.mp3`);

    const buffer = await downloadMediaMessage(
      { message: targetVideo },
      'buffer',
      {},
      { logger: console }
    );

    fs.writeFileSync(videoPath, buffer);

    await new Promise((resolve, reject) => {
      exec(`ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -q:a 5 "${audioPath}"`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const audioBuffer = fs.readFileSync(audioPath);

    await sock.sendMessage(sender, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: false
    }, { quoted: msg });

    fs.unlinkSync(videoPath);
    fs.unlinkSync(audioPath);
  } catch (err) {
    console.error('❌ Gagal ekstrak audio:', err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: '⚠️ Gagal mengekstrak audio. Mungkin videonya rusak atau ffmpeg-nya error 🥲',
    }, { quoted: msg });
  }
};
