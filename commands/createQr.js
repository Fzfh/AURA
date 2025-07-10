const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

module.exports = async function buatQR(sock, msg, text) {
  try {
    const sender = msg.key.participant || msg.key.remoteJid;
    const remoteJid = msg.key.remoteJid;

    // Cek apakah pesan dari grup
    const isGroup = remoteJid.endsWith('@g.us');

    if (isGroup) {
      const metadata = await sock.groupMetadata(remoteJid);
      const admins = metadata.participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id);

      if (!admins.includes(sender)) {
        return sock.sendMessage(remoteJid, {
          text: '🚫 Hanya admin grup yang boleh menggunakan perintah *.cqr*!',
        }, { quoted: msg });
      }
    }

    const qrText = text.trim();
    if (!qrText) {
      return sock.sendMessage(remoteJid, {
        text: '❌ Format salah!\nKetik: *.cqr teks_kamu*',
      }, { quoted: msg });
    }

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const qrPath = path.join(tempDir, `qr-${Date.now()}.png`);
    const logoPath = path.join(__dirname, '../media/logo.png');

    await QRCode.toFile(qrPath, qrText, {
      scale: 15,
      margin: 5,
      errorCorrectionLevel: 'H',
    });

    const qrImage = await Jimp.read(qrPath);
    const logo = await Jimp.read(logoPath);

    logo.resize(qrImage.bitmap.width / 4, Jimp.AUTO);

    const x = (qrImage.bitmap.width - logo.bitmap.width) / 2;
    const y = (qrImage.bitmap.height - logo.bitmap.height) / 2;

    qrImage.composite(logo, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
    });

    await qrImage.writeAsync(qrPath);

    const media = fs.readFileSync(qrPath);
    await sock.sendMessage(remoteJid, {
      image: media,
      caption: `✅ QR Code dengan logo berhasil dibuat`,
    }, { quoted: msg });

    fs.unlinkSync(qrPath);
  } catch (err) {
    console.error('❌ Error generate QR:', err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: '⚠️ Gagal membuat QR Code. Mungkin teksnya terlalu panjang?',
    }, { quoted: msg });
  }
};
