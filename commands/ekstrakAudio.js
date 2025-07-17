const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = async function ekstrakAudio(sock, msg) {
  try {
    const sender = msg.key.remoteJid;

    const isReply = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
    const isDirect = msg.message?.videoMessage;

    let mediaMsg;
    if (isReply) {
      mediaMsg = {
        key: {
          remoteJid: msg.key.remoteJid,
          id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId,
          participant: msg.message?.extendedTextMessage?.contextInfo?.participant,
        },
        message: msg.message?.extendedTextMessage?.contextInfo?.quotedMessage,
      };
    } else if (isDirect) {
      mediaMsg = msg;
    } else {
      return sock.sendMessage(sender, {
        text: '❌ Tidak ada video ditemukan. Kirim video dengan caption "ets" atau reply video dan ketik "ets".',
      }, { quoted: msg });
    }

    await sock.sendMessage(sender, {
      text: '🔄 Sedang mengekstrak audio...',
    }, { quoted: msg });

    const timestamp = Date.now();
    const videoFileName = `ekstrak-audio-aurabot #${timestamp}.mp4`;
    const audioFileName = `ekstrak-audio-aurabot #${timestamp}.mp3`;

    const videoPath = path.join(tmpdir(), videoFileName);
    const audioPath = path.join(tmpdir(), audioFileName);

    const buffer = await downloadMediaMessage(
      mediaMsg,
      'buffer',
      {},
      { logger: console }
    );

    fs.writeFileSync(videoPath, buffer);

    await new Promise((resolve, reject) => {
      exec(`ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -q:a 4 "${audioPath}"`, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const audioBuffer = fs.readFileSync(audioPath);

    await sock.sendMessage(sender, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      fileName: audioFileName,
      ptt: false,
    }, { quoted: msg });

    fs.unlinkSync(videoPath);
    fs.unlinkSync(audioPath);

  } catch (err) {
    console.error('❌ Gagal ekstrak audio:', err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: '⚠️ Gagal mengekstrak audio. Mungkin videonya rusak atau ffmpeg error 🥲',
    }, { quoted: msg });
  }
};
