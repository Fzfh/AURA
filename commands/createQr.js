const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

module.exports = async function buatQR(sock, msg, text) {
  try {
    const sender = msg.key.participant || msg.key.remoteJid;
    const remoteJid = msg.key.remoteJid;

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

    let qrText = text.trim().toLowerCase;

if (qrText.startsWith('.cqr')) {
  qrText = qrText.slice(4).trim();
} else if (qrText.startsWith('cqr')) {
  qrText = qrText.slice(3).trim();
}
    
if (qrText.startsWith('cqr')) {
  qrText = qrText.slice(3).trim();
} else if (qrText.startsWith('cqr')) {
  qrText = qrText.slice(3).trim();
}

    if (!qrText) {
      return sock.sendMessage(remoteJid, {
        text: '❌ Format salah!\nKetik: *.cqr teks_kamu*',
      }, { quoted: msg });
    }

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const qrPath = path.join(tempDir, `qr-${Date.now()}.jpg`);
    const logoPath = path.join(__dirname, '../media/logo.jpg');

    await QRCode.toFile(qrPath, qrText, {
      scale: 15,
      margin: 5,
      errorCorrectionLevel: 'H',
    });

    const qrImage = await Jimp.read(qrPath);
    const logo = await Jimp.read(logoPath);

    const logoSize = qrImage.bitmap.width / 5;
    logo.resize(logoSize, logoSize);

    const padding = 20;
    const box = new Jimp(logo.bitmap.width + padding, logo.bitmap.height + padding, 0xFFFFFFFF);

    const offsetX = (box.bitmap.width - logo.bitmap.width) / 2;
    const offsetY = (box.bitmap.height - logo.bitmap.height) / 2;

    box.composite(logo, offsetX, offsetY);

    const centerX = (qrImage.bitmap.width - box.bitmap.width) / 2;
    const centerY = (qrImage.bitmap.height - box.bitmap.height) / 2;

    qrImage.composite(box, centerX, centerY);

    await qrImage.writeAsync(qrPath);

    const media = fs.readFileSync(qrPath);
    await sock.sendMessage(remoteJid, {
      image: media,
      caption: `✅ QR Code berhasil dibuat!`,
    }, { quoted: msg });

    fs.unlinkSync(qrPath);
  } catch (err) {
    console.error('❌ Error generate QR:', err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: '⚠️ Gagal membuat QR Code. Coba lagi nanti ya~',
    }, { quoted: msg });
  }
};
