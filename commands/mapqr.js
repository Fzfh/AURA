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
        text: '🚫 Hanya admin grup yang bisa pakai fitur *.mapsqr*!',
      }, { quoted: msg });
    }
  }

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const locationMsg = quoted?.locationMessage;

  let input = text.trim();
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
    const logoPath = path.join(__dirname, '../media/logo.png');

    await QRCode.toFile(qrPath, mapsURL, {
      scale: 15,
      margin: 3,
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
    await sock.sendMessage(from, {
      image: media,
      caption: `📍 QR Code untuk lokasi:\n${mapsURL}`,
    }, { quoted: msg });

    fs.unlinkSync(qrPath);
  } catch (err) {
    console.error('❌ Gagal buat QR Maps:', err);
    return sock.sendMessage(from, {
      text: '⚠️ Gagal buat QR Maps. Coba lagi ya!',
    }, { quoted: msg });
  }
};
