const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const Jimp = require('jimp');
const jsQR = require('jsqr');
const {
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer
} = require('@zxing/library');

function parseTLV(data) {
  const result = {};
  let i = 0;

  while (i < data.length - 4) {
    const tag = data.substr(i, 2);
    const len = parseInt(data.substr(i + 2, 2));
    const value = data.substr(i + 4, len);
    result[tag] = value;
    i += 4 + len;
  }

  return result;
}

function extractQRISInfo(data) {
  const tlv = parseTLV(data);
  const merchantName = tlv['59'] || null;
  const merchantCity = tlv['60'] || null;

  let issuer = 'Tidak ditemukan';

  for (const tag of ['26', '27', '28', '29', '30', '51']) {
    if (tlv[tag]) {
      const nestedTLV = parseTLV(tlv[tag]);
      if (nestedTLV['00']) {
        const id = nestedTLV['00'];
        if (id.includes('shopee')) issuer = 'Shopee';
        else if (id.includes('dana')) issuer = 'DANA';
        else if (id.includes('linkaja')) issuer = 'LinkAja';
        else if (id.includes('gopay')) issuer = 'GoPay';
        else if (id.includes('ovo')) issuer = 'OVO';
        else issuer = id;
        break;
      }
    }
  }

  return {
    merchantName: merchantName?.trim(),
    merchantCity: merchantCity?.trim(),
    issuer
  };
}

function extractWiFiInfo(data) {
  const match = data.match(/^WIFI:(.*?);;$/);
  if (!match) return null;

  const fields = match[1].split(';');
  const info = {};
  for (const field of fields) {
    const [key, value] = field.split(':');
    if (key && value) {
      info[key] = value;
    }
  }

  return {
    ssid: info.S,
    password: info.P,
    type: info.T,
    hidden: info.H === 'true'
  };
}

async function handleQR(sock, msg) {
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const from = msg.key.remoteJid;

  if (!quoted?.imageMessage) {
    return sock.sendMessage(from, {
      text: '❌ Balas gambar QR-nya dulu ya, Auraa sayang~',
    }, { quoted: msg });
  }

  try {
    const mediaBuffer = await downloadMediaMessage(
      { key: msg.key, message: quoted },
      'buffer',
      {},
      { logger: console }
    );

    let image = await Jimp.read(mediaBuffer);
    if (image.bitmap.width < 300) {
      image = image.resize(400, Jimp.AUTO);
    }

    const { width, height, data } = image.bitmap;
    const grayscale = new Uint8ClampedArray(width * height);

    for (let i = 0; i < width * height; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      grayscale[i] = (r + g + b) / 3;
    }

    const source = new RGBLuminanceSource(grayscale, width, height);
    const bitmap = new BinaryBitmap(new HybridBinarizer(source));

    const reader = new MultiFormatReader();
    reader.setHints(new Map([
      [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]]
    ]));

    let resultText = null;

    try {
      const result = reader.decode(bitmap);
      resultText = result.getText();
    } catch {
      const jsqrResult = jsQR(data, width, height);
      if (jsqrResult) {
        resultText = jsqrResult.data;
      }
    }

    if (resultText) {
      // Deteksi QRIS
      if (/^000201/.test(resultText)) {
        const { merchantName, merchantCity, issuer } = extractQRISInfo(resultText);
        const info = `✅ *QRIS berhasil dibaca!*\n\n*Isi QR Merchant:*\n\`${resultText}\`\n\n🏪 *Merchant/Toko:* ${merchantName || 'Tidak ditemukan'}\n📍 *Kota:* ${merchantCity || 'Tidak tersedia'}\n🏢 *Penyedia:* ${issuer || 'Tidak diketahui'}`;
        return sock.sendMessage(from, { text: info }, { quoted: msg });
      }

      // Deteksi Wi-Fi
      if (/^WIFI:/.test(resultText)) {
        const wifiInfo = extractWiFiInfo(resultText);
        if (wifiInfo) {
          const wifiMsg = `📶 *QR Wi-Fi Terdeteksi!*\n\n🔐 *Tipe:* ${wifiInfo.type || 'Tidak diketahui'}\n📡 *Nama WiFi:* ${wifiInfo.ssid || 'Tidak ditemukan'}\n🔑 *Password:* ${wifiInfo.password || 'Kosong / Terbuka'}\n*Status Hidden:* ${wifiInfo.hidden ? 'Iya (disembunyikan)' : 'Tidak'}`;
          return sock.sendMessage(from, { text: wifiMsg }, { quoted: msg });
        }
      }

      // Jika QR biasa (text / link / apapun)
      return sock.sendMessage(from, {
        text: `✅ *QR berhasil dibaca!*\n\n\`Isi QR:\`\n${resultText.length > 300 ? resultText.slice(0, 300) + '... (terpotong)' : resultText}`,
      }, { quoted: msg });
    }

    // Gagal terbaca sama sekali
    return sock.sendMessage(from, {
      text: '❌ QR tidak terbaca, bahkan oleh scanner cadangan 😭\n\nCoba pastikan:\n- Gambar cukup besar\n- QR tidak terlalu buram\n- Bukan QR view-once yang blur~',
    }, { quoted: msg });

  } catch (err) {
    console.error('❌ Error QR:', err);
    return sock.sendMessage(from, {
      text: '⚠️ Gagal membaca QR. Pastikan gambarnya jelas yaa~',
    }, { quoted: msg });
  }
}

module.exports = handleQR;
