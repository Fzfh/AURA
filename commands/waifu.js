const axios = require('axios');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');
const spamTracker = new Map();

const WAIFU_SPAM_TIMEOUT = 10 * 1000;
const allowedTags = [
  'waifu', 'maid', 'marin-kitagawa', 'mori-calliope', 'raiden-shogun',
  'oppai', 'selfies', 'uniform', 'kamisato-ayaka'
];

const TEMP_DIR = '/mnt/data/temp';

module.exports = async function waifu(sock, msg, text) {
  try {
    const sender = msg.key.remoteJid;
    const userId = msg.key.participant || sender;

    const now = Date.now();
    const lastRequest = spamTracker.get(userId) || 0;
    if (now - lastRequest < WAIFU_SPAM_TIMEOUT) {
      return sock.sendMessage(sender, {
        text: '🕓 Tunggu sebentar ya... jangan spam waifuuu~ 😵‍💫',
      }, { quoted: msg });
    }

    const args = text?.trim().split(/\s+/);
    const type = args[0]?.toLowerCase();

    if (!type) {
      return sock.sendMessage(sender, {
        text: `💡Contoh:\n.waifu maid\n.waifu raiden-shogun\n\n📜 List tag SFW:\n• ${allowedTags.join('\n• ')}`,
      }, { quoted: msg });
    }

    if (!allowedTags.includes(type)) {
      return sock.sendMessage(sender, {
        text: `❌ Tag *${type}* gak ditemukan. Coba:\n• ${allowedTags.join('\n• ')}`,
      }, { quoted: msg });
    }

    spamTracker.set(userId, now);

    const res = await axios.get(`https://api.waifu.im/search`, {
      params: {
        included_tags: type,
        is_nsfw: false,
        limit: 5
      },
      headers: { 'Accept-Version': 'v5' }
    });

    const images = res.data?.images || [];
    if (!images.length) {
      return sock.sendMessage(sender, {
        text: `❌ Gak nemu waifu dengan tag *${type}*. Coba tag lain yaa~ 💔`,
      }, { quoted: msg });
    }

    const image = images[Math.floor(Math.random() * images.length)];
    const mediaUrl = image.url;
    const ext = path.extname(mediaUrl).toLowerCase();
    const caption = `🖼️ ${type.replace(/-/g, ' ')} by AuraBot`;

    if (ext === '.gif') {
      const filename = `waifu_${Date.now()}`;
      const gifPath = path.join(TEMP_DIR, `${filename}.gif`);
      const mp4Path = path.join(TEMP_DIR, `${filename}.mp4`);

      const writer = fs.createWriteStream(gifPath);
      const response = await axios.get(mediaUrl, { responseType: 'stream' });
      response.data.pipe(writer);

      writer.on('finish', () => {
        ffmpeg(gifPath)
          .outputOptions('-movflags faststart')
          .toFormat('mp4')
          .on('end', async () => {
            await sock.sendMessage(sender, {
              video: { url: mp4Path },
              caption,
              gifPlayback: true
            }, { quoted: msg });

            fs.unlinkSync(gifPath);
            fs.unlinkSync(mp4Path);
          })
          .on('error', async (err) => {
            console.error('[FFMPEG ERROR]', err.message);
            await sock.sendMessage(sender, {
              text: '❌ Gagal konversi GIF ke video. Coba lagi yaa 🥹',
            }, { quoted: msg });
          })
          .save(mp4Path);
      });

    } else if (['.webm', '.mp4'].includes(ext)) {
      await sock.sendMessage(sender, {
        video: { url: mediaUrl },
        caption,
        gifPlayback: true
      }, { quoted: msg });
    } else {
      await sock.sendMessage(sender, {
        image: { url: mediaUrl },
        caption
      }, { quoted: msg });
    }

  } catch (err) {
    console.error('[WAIFU.IM ERROR]', err?.response?.data || err.message);
    await sock.sendMessage(msg.key.remoteJid, {
      text: '❌ Gagal ambil waifu. Coba lagi nanti yaa 🥹',
    }, { quoted: msg });
  }
};
