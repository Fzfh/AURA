const spamTracker = new Map();
const mutedUsers = new Map();
const memoryMap = new Map();
const muteDuration = 2 * 60 * 1000;

const add = require('../commands/add');
const { handleStaticCommand } = require('../core/handler/staticCommand');
const tagall = require('../commands/tagall');
const kick = require('../commands/kick');
const menfess = require('../commands/menfess');
const handleWelcome = require('../commands/welcome');
const { adminList, toxicWords } = require('../setting/setting');
const askOpenAI = require('../core/utils/openai');
const { createStickerFromMessage, createStickerFromText } = require('../core/stickerHelper');
const downloadTiktok = require('../commands/tiktokDownloader');
const downloadInstagram = require('../commands/igDownloader');
const downloadYouTubeMP3 = require('../commands/youtubeDownloader');
const sendAll = require('../commands/sendAll');
const showOnce = require('../commands/show');
const handleQR = require('../commands/qris');
const buatQR = require('../commands/createQr');
const mapsQR = require('../commands/mapqr');
const linkMap = require('../commands/linkmap');
const waifuhen = require('../commands/waifuhen');
const waifu = require('../commands/waifu');
const stickerToMedia = require('../commands/stickerToMedia');
const handleTranslate = require('../commands/translate');
const { addAdmin, removeAdmin } = require('../commands/admin');
const buatGrup = require('../commands/buatGrup');

const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const greetedUsers = new Set();

function getBotJid(sock) {
  return (sock.user?.id || '').split(':')[0] + '@s.whatsapp.net';
}

async function botFirstResponse({ sock, sender, msg }, options = {}) {
  const botName = options.botBehavior?.botName || 'Bot';
  const botMenu = options.botBehavior?.botMenu || '/menu';
  const greetingText = `Halo! Saya *${botName}* 🤖.\nKetik *${botMenu}* untuk melihat menu yang tersedia yaa~`;
  await sock.sendMessage(sender, { text: greetingText }, { quoted: msg });
}

async function handleResponder(sock, msg) {
  try {
    if (!msg.message) return;
    const sender = msg.key.remoteJid;
    const userId = sender;
    const from = sender;
    const actualUserId = msg.key.participant || msg.participant || msg.message?.extendedTextMessage?.contextInfo?.participant || sender;
    const isGroup = sender.endsWith('@g.us');

    const content = msg.message?.viewOnceMessageV2?.message || msg.message;
    const text =
      content?.conversation ||
      content?.extendedTextMessage?.text ||
      content?.imageMessage?.caption ||
      content?.videoMessage?.caption || '';

    const body = text;
    const command = body.trim().split(' ')[0].toLowerCase();
    const args = body.trim().split(' ').slice(1);
    const lowerText = text.toLowerCase();

    if (!text) return;

    const handledStatic = await handleStaticCommand(sock, msg, lowerText, userId, from, body);
    if (handledStatic) return;

    if (text.startsWith('/') || text.startsWith('.')) {
      const now = Date.now();
      const userSpam = spamTracker.get(userId) || [];
      const filtered = userSpam.filter(t => now - t < 10000);
      filtered.push(now);
      spamTracker.set(userId, filtered);

      if (filtered.length > 5 && !adminList.includes(userId)) {
        mutedUsers.set(userId, now + muteDuration);
        return sock.sendMessage(sender, { text: '🔇 Kamu terlalu banyak mengirim command! Bot diam 2 menit.' }, { quoted: msg });
      }
    }

    const botJid = getBotJid(sock);
    const contextInfo = content?.extendedTextMessage?.contextInfo || {};
    const mentionedJids = contextInfo.mentionedJid || [];
    const isMentioned = mentionedJids.includes(botJid);
    const isMentionedToBot = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(botJid);
    const isReplyToBot = contextInfo?.quotedMessage && (contextInfo?.participant === botJid || contextInfo?.remoteJid === botJid);
    const isPrivate = !sender.endsWith('@g.us');

    if ((!isGroup || isMentioned) && !greetedUsers.has(userId)) {
      greetedUsers.add(userId);
      await botFirstResponse({ sock, sender, msg }, {
        botBehavior: { botName: 'AuraBot', botMenu: '/menu' }
      });
    }

    const grupCreated = await buatGrup(sock, msg, text);
    if (grupCreated) return;

    const handledMenfess = await menfess(sock, msg, text);
    if (handledMenfess) return;

    if (text.startsWith('.na')) return await addAdmin(sock, msg, sender, actualUserId, text);
    if (text.startsWith('.una')) return await removeAdmin(sock, msg, sender, actualUserId, text);

    if (['/listbahasa', '.listbahasa', 'listbahasa', 'list bahasa'].includes(lowerText)) {
      const listBahasa = `🌐 *Daftar Kode Bahasa Umum:*\n\n🇮🇩 id\n🇬🇧 en\n🇯🇵 ja\n... (dan seterusnya)`;
      return sock.sendMessage(sender, { text: listBahasa }, { quoted: msg });
    }

    if (command === '/tl' || command === '.tl' || command === 'tl') {
      return await handleTranslate(sock, msg, text, command, args);
    }

    if (command === 'waifuhen') return await waifuhen(sock, msg, args.join(' '));
    if (command === '.waifu') return await waifu(sock, msg, args.join(' '));
    if (text.startsWith('.sm')) return await stickerToMedia(sock, msg);
    if (text.startsWith('.linkmap')) return await linkMap(sock, msg, text.split('.linkmap')[1]?.trim() || '');
    if (text.startsWith('.mapqr')) return await mapsQR(sock, msg, text.split('.mapqr')[1]?.trim() || '');
    if (text.startsWith('.qr')) return await handleQR(sock, msg);
    if (text.startsWith('.cqr ')) return await buatQR(sock, msg, text.split('.cqr ')[1]);

    if (body.startsWith('.show')) return await showOnce(sock, msg);
    if (body.startsWith('.sendAll')) {
      const pesan = body.split(' ').slice(1).join(' ');
      if (!pesan) return sock.sendMessage(from, { text: '❌ Format: .sendAll isi pesan' }, { quoted: msg });
      await sock.sendMessage(from, { text: '🔄 Mengirim ke semua kontak yang 1 grup...' }, { quoted: msg });
      await sendAll(sock, sender, pesan);
      return sock.sendMessage(from, { text: '✅ Pesan berhasil dikirim!' }, { quoted: msg });
    }

    if (text.startsWith('.dyts ')) 
    if (text.startsWith('.d ')) 
    if (text.startsWith('.ds ')) 
    if (text.startsWith('.dig ')) 

    if (
      lowerText.startsWith('kick') || lowerText.startsWith('.kick') ||
      lowerText.startsWith('kik') || lowerText.startsWith('.kik')
    ) {
      // Cegah jika reply ke bot
      const repliedId = msg.message?.extendedTextMessage?.contextInfo?.participant;
      if (repliedId === botJid || text.includes(botJid.split('@')[0])) {
        return sock.sendMessage(from, {
          text: '❌ Jangan ketik `.kick` sambil reply atau masukin nomorku yaa! Aku bisa keluar sendiri 🥲',
        }, { quoted: msg });
      }

      return await kick(sock, msg, text, isGroup);
    }

    if (lowerText.startsWith('.tagall') || lowerText.startsWith('tagall') || lowerText.startsWith('tag semua')) {
      return await tagall(sock, msg, text, isGroup);
    }

    if (lowerText.startsWith('.add') || lowerText.startsWith('add')) {
      const raw = text.split(' ').slice(1).join(' ');
      const nomorList = raw.split(',').map(n => n.startsWith('0') ? '62' + n.slice(1) : n.trim());
      return await add(sock, msg, nomorList, sender, userId);
    }

    if (['s', 'sticker'].includes(lowerText)) {
      try {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const hasMedia = quoted?.imageMessage || quoted?.videoMessage ||
                         msg.message?.imageMessage || msg.message?.videoMessage;
        const caption = msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || '';
        const captionMatch = ['s', 'sticker'].includes(caption.toLowerCase());

        if (hasMedia || captionMatch) {
          await createStickerFromMessage(sock, msg);
        } else {
          await sock.sendMessage(sender, {
            text: 'Kirim gambar/video lalu reply dengan "s", atau beri caption "s" / "sticker".',
          }, { quoted: msg });
        }
      } catch (err) {
        console.error('❌ Gagal buat stiker:', err);
        await sock.sendMessage(sender, { text: 'Ups! Gagal bikin stiker 😖' }, { quoted: msg });
      }
      return;
    }

    if (command === 'stickertext' || command === 'st') {
      if (!args[0]) return sock.sendMessage(sender, { text: 'Ketik: stikertext Halo dunia!' }, { quoted: msg });
      const teks = args.join(' ');
      const stickerBuffer = await createStickerFromText(teks);
      await sock.sendMessage(sender, { sticker: stickerBuffer }, { quoted: msg });
    }

    if (text === '.reset') {
      if (!adminList.includes(actualUserId)) {
        return sock.sendMessage(sender, {
          text: '❌ Maaf, hanya admin yang boleh reset ingatan AuraBot 🙅‍♂️'
        }, { quoted: msg });
      }

      memoryMap.delete(actualUserId);
      return sock.sendMessage(sender, {
        text: '🧠 Ingatan AuraBot Telah Direset, Ayo Buat Obrolan Baru~!'
      }, { quoted: msg });
    }
    
    if (isMentionedToBot || isMentioned || isReplyToBot || isPrivate) {
      let query = '';
      const quoted = contextInfo.quotedMessage;
      const quotedSender = contextInfo.participant || null;

      if (quoted && quotedSender !== botJid) {
        if (quoted.conversation) query = quoted.conversation;
        else if (quoted.imageMessage) query = '[Gambar dikirim]';
        else if (quoted.videoMessage) query = '[Video dikirim]';
        else if (quoted.locationMessage) query = '[Lokasi dikirim]';
        else query = '[Pesan tidak dikenali]';
      } else {
        query = text;
      }

      if (query?.trim()) {
        try {
          await sock.sendPresenceUpdate('composing', sender);
          const history = memoryMap.get(userId) || [];
          history.push({ role: 'user', content: query });
          const aiReply = await askOpenAI(history);
          history.push({ role: 'assistant', content: aiReply });
          memoryMap.set(userId, history.slice(-15));
          return sock.sendMessage(sender, { text: aiReply }, { quoted: msg });
        } catch (err) {
          console.error('❌ Gagal respon AI:', err);
          return sock.sendMessage(sender, {
            text: '⚠️ Maaf, AI-nya lagi error nih~ coba beberapa saat lagi ya!',
          }, { quoted: msg });
        }
      }
    }

  } catch (error) {
    console.error('❌ Error di handleResponder:', error);
  }
}

const registeredSockets = new WeakSet();

function registerGroupUpdateListener(sock) {
  if (registeredSockets.has(sock)) return;
  registeredSockets.add(sock);

  sock.ev.removeAllListeners('group-participants.update');
  sock.ev.on('group-participants.update', async (update) => {
    console.log('[👥] Event grup masuk:', update.action, update.participants);
    await handleWelcome(sock, update);
  });

  console.log('[✅] Listener grup berhasil didaftarkan');
}

module.exports = {
  handleResponder,
  greetedUsers,
  botFirstResponse,
  registerGroupUpdateListener
};
