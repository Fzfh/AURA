const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = async function ekstrakAudio(sock, msg) {
  try {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const video = msg.message?.videoMessage || quoted?.videoMessage;

    if (!video) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Video tidak ditemukan! Kirim video dengan caption `ets` atau reply video lalu ketik `ets`.',
      }, { quoted: msg });
    }

    const tempDir = tmpdir();
    const videoPath = path.join(tempDir, `video-${uuidv4()}.mp4`);
    const audioPath = path.join(tempDir, `audio-${uuidv4()}.mp3`);

    const buffer = await downloadMediaMessage(
      { message: video },
      'buffer',
      {},
      { logger: console }
    );

    fs.writeFileSync(videoPath, buffer);

    await sock.sendMessage(msg.key.remoteJid, {
      text: '🔄 Sedang mengekstrak audio...',
    }, { quoted: msg });

    await new Promise((resolve, reject) => {
      exec(`ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -q:a 5 "${audioPath}"`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const audioBuffer = fs.readFileSync(audioPath);

    await sock.sendMessage(msg.key.remoteJid, {
      audio: audioBuffer,
      mimetype: 'audio/mp4',
      ptt: false
    }, { quoted: msg });

    fs.unlinkSync(videoPath);
    fs.unlinkSync(audioPath);
  } catch (err) {
    console.error('❌ Gagal ekstrak audio:', err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: '⚠️ Gagal mengekstrak audio. Pastikan kirim/reply video yaa!',
    }, { quoted: msg });
  }
};
