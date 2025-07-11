const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

module.exports = async (msg, sock) => {
  const from = msg.key.remoteJid;
  const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
  const args = body.split(' ');
  const url = args[1];

  if (!url || !url.includes('music.youtube.com')) {
    return sock.sendMessage(from, {
      text: '⚠️ Kirim link dari *YouTube Music* ya. Contoh:\n.mp3 https://music.youtube.com/watch?v=xxxxx'
    }, { quoted: msg });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    const fileName = `${title}-${Date.now()}.mp3`;

    const tempDir = path.join(__dirname, '../temp');
    
    // 🛠️ Buat folder temp kalau belum ada
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, fileName);

    await sock.sendMessage(from, {
      text: `🎶 Mengunduh lagu: *${title}*\nTunggu sebentar ya...`
    }, { quoted: msg });

    const stream = ytdl(url, {
      quality: 'highestaudio',
      filter: 'audioonly'
    });

    const output = fs.createWriteStream(filePath);
    stream.pipe(output);

    output.on('finish', async () => {
      const stats = fs.statSync(filePath);
      const sizeMB = stats.size / (1024 * 1024);

      if (sizeMB > 50) {
        await sock.sendMessage(from, {
          text: '⚠️ Ukuran audio terlalu besar (>50MB). Gagal dikirim ke WhatsApp.'
        }, { quoted: msg });
        fs.unlinkSync(filePath);
        return;
      }

      await sock.sendMessage(from, {
        audio: fs.readFileSync(filePath),
        mimetype: 'audio/mp4',
        ptt: false
      }, { quoted: msg });

      fs.unlinkSync(filePath);
    });

  } catch (err) {
    console.error(err);
    sock.sendMessage(from, {
      text: '❌ Gagal download audio. Link error atau tidak valid.'
    }, { quoted: msg });
  }
};
