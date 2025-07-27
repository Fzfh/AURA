const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const { promisify } = require('util');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fontPathImpact = '/usr/share/fonts/truetype/msttcorefonts/Impact.ttf';
const fontPathArialNarrow = path.join(__dirname, '..', 'media', 'fonts', 'ArialNarrow.ttf');

registerFont(fontPathImpact, { family: 'Impact' });
registerFont(fontPathArialNarrow, { family: 'Arial Narrow' });


const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const twemoji = require('twemoji');
const emojiDir = path.join(process.cwd(), 'media', 'emoji');

if (typeof fetch !== 'function') {
  global.fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
}

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

async function stickerFromMediaCommand(sock, msg, lowerText) {
  await createStickerFromMessage(sock, msg);
  return true;
}

async function stickerTextCommand(sock, msg, lowerText, args) {
  if (!args[0]) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: `Mau buat stiker dari teks?  
Cukup ketik:  \`stickertext <teks kamu>\`

Contoh:  \`stickertext halo dunia\`

*Mau lebih cepat?*  
Pakai saja perintah singkat:  \`st halo dunia\`

Stiker akan langsung tercipta dari teks kamu!
`
    }, { quoted: msg });
    return true;
  }

  const isiTeks = args.join(' ');
  try {
    const stickerBuffer = await createStickerFromText(isiTeks);
    await sock.sendMessage(msg.key.remoteJid, { sticker: stickerBuffer }, { quoted: msg });
  } catch (err) {
    console.error('❌ Error stickerTextCommand:', err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: 'Ups! Gagal bikin stiker dari teks 😖'
    }, { quoted: msg });
  }

  return true;
}

async function overlayTextToImage(buffer, text) {
  const W = 512, H = 512, fontSize = 70, pad = 20;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Konversi WebP ke JPEG dulu (fix error canvas)
  const jpegBuffer = await sharp(buffer).jpeg().toBuffer();
  const img = await loadImage(jpegBuffer);

  ctx.drawImage(img, 0, 0, W, H);

  ctx.font = `bold ${fontSize}px "Impact", "Arial Narrow", Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  // 📝 Pakai teks asli TANPA toUpperCase!
  const lines = wrapText(ctx, text, W - pad * 2);
  const lh = fontSize + 5;
  const startY = H - pad - ((lines.length - 1) * lh);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const y = startY + i * lh;

    // Outline hitam
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.strokeText(line, W / 2, y);

    // Isi putih
    ctx.fillStyle = 'white';
    ctx.fillText(line, W / 2, y);
  }

  return canvas.toBuffer('image/jpeg', { quality: 0.95 });
}

async function createStickerFromMessage(sock, msg) {
  try {
    const messageContent = msg.message;
    const type = Object.keys(messageContent)[0];
    const content = messageContent[type];

    let mediaMessage;
    let captionText = null;

    // Ambil caption jika dari media langsung
    if (type === 'imageMessage' || type === 'videoMessage') {
      captionText = content?.caption?.trim();
    }
    // Ambil caption jika dari reply (extendedTextMessage)
    else if (type === 'extendedTextMessage') {
      captionText = content?.text?.trim();
    }

     // Ambil hanya jika caption diawali s, .s, !s, -s (fleksibel)
    if (captionText && /^[\.\!\-]?s\s/i.test(captionText)) {
      captionText = captionText.replace(/^[\.\!\-]?s\s/i, '').trim();
    } else {
      captionText = null;
    }

    // Deteksi media langsung
    if (
      (type === 'imageMessage' || type === 'videoMessage') &&
      content?.mimetype &&
      content?.url
    ) {
      mediaMessage = msg;
    }
    // Deteksi media dari reply
    else if (
      type === 'extendedTextMessage' &&
      messageContent.extendedTextMessage.contextInfo &&
      messageContent.extendedTextMessage.contextInfo.quotedMessage
    ) {
      const quoted = messageContent.extendedTextMessage.contextInfo;
      mediaMessage = {
        key: {
          remoteJid: msg.key.remoteJid,
          id: quoted.stanzaId,
          fromMe: false,
          participant: quoted.participant,
        },
        message: quoted.quotedMessage,
      };
    }

    if (!mediaMessage) throw new Error('❌ Tidak ada media untuk dijadikan stiker.');

    await new Promise(resolve => setTimeout(resolve, 300));

    const buffer = await downloadMediaMessage(mediaMessage, 'buffer', {}, {
      logger: sock.logger,
      reuploadRequest: sock,
    });

    const isVideo =
      type === 'videoMessage' ||
      mediaMessage.message?.videoMessage;

    let stickerBuffer;

    if (isVideo) {
      stickerBuffer = await convertVideoToSticker(buffer, captionText);
    } else {
      // Kalau ada caption meme
      if (captionText) {
        const memeBuffer = await overlayTextToImage(buffer, captionText);
        stickerBuffer = await new Sticker(memeBuffer, {
          pack: 'AuraBot',
          author: 'AURA',
          type: StickerTypes.DEFAULT,
          quality: 70,
        }).toBuffer();
      } else {
        stickerBuffer = await new Sticker(buffer, {
          pack: 'AuraBot',
          author: 'AURA',
          type: StickerTypes.DEFAULT,
          quality: 70,
        }).toBuffer();
      }
    }

    await sock.sendMessage(msg.key.remoteJid, { sticker: stickerBuffer }, { quoted: msg });

  } catch (err) {
    console.error('❌ Error saat bikin stiker:', err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: 'Gagal bikin stiker 😢. Pastikan kamu kirim gambar/video maksimal 6 detik ya!',
    }, { quoted: msg });
  }
}

async function convertVideoToSticker(buffer, captionText = null) {
  const tempId = uuidv4();
  const inputPath = path.join(tmpdir(), `${tempId}.mp4`);
  const outputPath = path.join(tmpdir(), `${tempId}.webp`);
  const fontPath = '/usr/share/fonts/truetype/msttcorefonts/Impact.ttf'; // pastikan file ini ada

  try {
    await writeFile(inputPath, buffer);

    // Teks akan di-escape agar tidak error di shell
    let drawtextFilter = '';
    if (captionText) {
      const escapedText = captionText.replace(/:/g, '\\:').replace(/'/g, "\\\\'");

      drawtextFilter = `drawtext=fontfile='${fontPath}':text='${escapedText}':fontcolor=white:bordercolor=black:borderw=2:x=(w-text_w)/2:y=h-text_h-20:fontsize=36,`;
    }

    const ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "${drawtextFilter}fps=12,scale=iw*min(512/iw\\,512/ih):ih*min(512/iw\\,512/ih):flags=lanczos,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -ss 0 -t 6 -an -loop 0 -y "${outputPath}"`;

    await execPromise(ffmpegCmd);

    if (!fs.existsSync(outputPath)) throw new Error(`❌ FFmpeg gagal membuat file: ${outputPath}`);

    return await readFile(outputPath);
  } finally {
    cleanupFiles([inputPath, outputPath]);
  }
}


// Fungsi wrap teks
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const testLine = line + word + ' ';
    const width = ctx.measureText(testLine).width;
    if (width > maxWidth && line) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

async function createStickerFromText(text) {
  const W = 512, H = 512, fontSize = 80, pad = 40;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'black';
  ctx.font = `${fontSize}px "Arial Narrow", Arial`;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  const lines = wrapText(ctx, text, W - pad * 2);
  const lh = fontSize + 5;
  const startY = (H - lines.length * lh) / 2;

  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lh;
    const parts = twemoji.parse(lines[i]).split(/(<img.*?>)/g).filter(Boolean);
    let x = pad;

    for (const part of parts) {
      if (part.startsWith('<img')) {
        const match = part.match(/alt="([^"]+)"/);
        if (match) {
          const codepoint = twemoji.convert.toCodePoint(match[1]);
          let filePath = path.join(emojiDir, `${codepoint}.png`);

          if (!fs.existsSync(filePath)) {
            const fallbackCode = codepoint.replace(/-fe0f/g, '');
            const fallbackPath = path.join(emojiDir, `${fallbackCode}.png`);
            if (fs.existsSync(fallbackPath)) filePath = fallbackPath;
            else {
              const first = codepoint.split('-')[0];
              const finalFallback = path.join(emojiDir, `${first}.png`);
              if (fs.existsSync(finalFallback)) filePath = finalFallback;
              else {
                ctx.fillText('?', x, y);
                x += fontSize;
                continue;
              }
            }
          }

          try {
            const img = await loadImage(filePath);
            ctx.drawImage(img, x, y + 4, fontSize, fontSize);
            x += fontSize;
          } catch (err) {
            ctx.fillText('?', x, y);
            x += fontSize;
          }
        }
      } else {
        ctx.fillText(part, x, y);
        x += ctx.measureText(part).width;
      }
    }
  }

  const imgBuf = canvas.toBuffer('image/jpeg', { quality: 0.1 });
  const sticker = new Sticker(imgBuf, {
    pack: 'AuraBot',
    author: 'Mau Sewa Bot Auto Sticker Anomali? Hub: 083194900080',
    type: StickerTypes.DEFAULT,
    quality: 5
  });
  return sticker.toBuffer();
}

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(stderr || stdout);
      else resolve(stdout);
    });
  });
}

function cleanupFiles(filePaths) {
  for (const file of filePaths) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
}

module.exports = {
  createStickerFromMessage,
  createStickerFromText,
  stickerTextCommand,
  stickerFromMediaCommand
}
