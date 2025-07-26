const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

module.exports = async function mapsQR(sock, msg, text) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (from.endsWith('@g.us')) {
    const metadata = await sock.groupMetadata(from);
    const groupAdmins = metadata.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);

    if (!groupAdmins.includes(sender)) {
      return sock.sendMessage(from, {
        text: '🚫 Hanya admin grup yang bisa pakai fitur *.mapqr*!',
      }, { quoted: msg });
    }
  }

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const locationMsg = quoted?.locationMessage;

  let input = text.trim();
  input = input.replace(/^\.?mapqr\s*/i, '').trim();
  
  if (locationMsg) {
    const lat = locationMsg.degreesLatitude;
    const lon = locationMsg.degreesLongitude;
    input = `${lat},${lon}`;
  }

  if (!input) {
    return sock.sendMessage(from, {
      text: '❌ Format salah!\nBalas lokasi dengan *.mapsqr* atau ketik manual:\n.mapsqr Monas Jakarta\natau .mapsqr -6.2,106.8',
    }, { quoted: msg });
  }

  try {
    let mapsURL = '';
    if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(input)) {
      mapsURL = `https://www.google.com/maps?q=${input}`;
    } else {
      const query = encodeURIComponent(input);
      mapsURL = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const qrPath = path.join(tempDir, `mapsqr-${Date.now()}.png`);
    const logoPath = path.join(__dirname, '../media/logo.jpg');

    await QRCode.toFile(qrPath, mapsURL, {
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
    await sock.sendMessage(from, {
      image: media,
      caption: `📍 QR Code Lokasi Kamu udah jadi nih, tinggal scan ajaa`,
    }, { quoted: msg });

    fs.unlinkSync(qrPath);
  } catch (err) {
    console.error('❌ Gagal buat QR Maps:', err);
    return sock.sendMessage(from, {
      text: '⚠️ Gagal buat QR Maps. Coba lagi ya!',
    }, { quoted: msg });
  }
};
