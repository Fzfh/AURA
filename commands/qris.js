const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const sharp = require('sharp');
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
  const from = msg.key.remoteJid;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const mediaMessage =
    quoted?.imageMessage || quoted?.stickerMessage?.isAnimated === false
      ? quoted
      : msg.message?.imageMessage || msg.message?.stickerMessage;

  if (!mediaMessage) {
    return sock.sendMessage(from, {
      text: '❌ Kirim atau balas gambar QR ya, Auraa sayang~',
    }, { quoted: msg });
  }

  try {
    const mediaBuffer = await downloadMediaMessage(
      quoted ? { key: msg.key, message: quoted } : msg,
      'buffer',
      {},
      { logger: console }
    );

    const pngBuffer = await sharp(mediaBuffer).png().toBuffer();
    const image = await Jimp.read(pngBuffer);

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

    let results = [];
    try {
      const result = reader.decode(bitmap);
      results.push(result.getText());
    } catch {
      const jsqrResult = jsQR(data, width, height);
      if (jsqrResult) results.push(jsqrResult.data);
    }

    if (results.length === 0) {
      return sock.sendMessage(from, {
        text: '❌ QR tidak terbaca 😭 Coba perbesar, jangan blur yaa~',
      }, { quoted: msg });
    }

    let combinedInfo = `🔍 *${results.length} QR Terdeteksi!*

`;
    for (const resultText of results) {
      if (/^000201/.test(resultText)) {
        const { merchantName, merchantCity, issuer } = extractQRISInfo(resultText);
        combinedInfo += `🏪 *Merchant:* ${merchantName || '-'}
📍 *Kota:* ${merchantCity || '-'}
🏢 *Penyedia:* ${issuer || '-'}
────────────────────
`;
      } else if (/^WIFI:/.test(resultText)) {
        const wifiInfo = extractWiFiInfo(resultText);
        combinedInfo += `📡 *WiFi:* ${wifiInfo?.ssid || '-'}
🔑 *Password:* ${wifiInfo?.password || '-'}
────────────────────
`;
      } else {
        combinedInfo += `🔸 *QR Lain:*
${resultText.slice(0, 300)}
────────────────────
`;
      }
    }

    await sock.sendMessage(from, { text: combinedInfo }, { quoted: msg });
  } catch (err) {
    console.error('❌ Error QR:', err);
    return sock.sendMessage(from, {
      text: '⚠️ Gagal membaca QR. Coba ulang yaa~',
    }, { quoted: msg });
  }
}

module.exports = handleQR;
