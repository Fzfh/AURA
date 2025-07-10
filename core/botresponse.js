const spamTracker = new Map();
const mutedUsers = new Map();
const memoryMap = new Map();
const muteDuration = 2 * 60 * 1000;

const { add, tagall, kick, menfess, welcome, tiktokDownloader,
       igDownloader, youtubeDownloader,
       sendAll, show, qris, createQr, mapqr, linkmap,
       waifuhen, waifu, stickerToMedia, admin, translate } = require('../commands/commandRequire/commandRequire');
const { staticCommand, openai, stickerHelper } = require('../core/coreRequire/coreRequire');
const { adminList } = require('../setting/setting');
const greetedUsers = new Set();
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

async function botFirstResponse({ sock, sender, msg }, options = {}) {
  const botName = options.botBehavior?.botName || 'Bot';
  const botMenu = options.botBehavior?.botMenu || '/menu';
  const greetingText = `Halo! Saya *${botName}* 🤖.\nKetik *${botMenu}* untuk melihat menu yang tersedia yaa~`;
  await sock.sendMessage(sender, { text: greetingText }, { quoted: msg });
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

async function handleResponder(sock, msg) {
  try {
    if (!msg.message) return;
    const sender = msg.key.remoteJid;
    const userId = sender;
    const from = sender;
    const actualUserId = msg.key.participant || msg.participant || msg.message?.extendedTextMessage?.contextInfo?.participant || sender;
    const isGroup = sender.endsWith('@g.us');

    const content = msg.message?.viewOnceMessageV2?.message || msg.message;
    const text = content?.conversation || content?.extendedTextMessage?.text || content?.imageMessage?.caption || content?.videoMessage?.caption || '';

    if (!text) return;
    const body = text;
    const command = body.trim().split(' ')[0].toLowerCase();
    const args = body.trim().split(' ').slice(1);
    const lowerText = text.toLowerCase();

    // ========== ANTI SPAM ==========
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

    // ========== SAPAAN BOT ==========
    const botNumber = sock.user.id.split(':')[0];
    const botJid = botNumber.includes('@s.whatsapp.net') ? botNumber : `${botNumber}@s.whatsapp.net`;
    const contextInfo = content?.extendedTextMessage?.contextInfo || {};
    const mentionedJids = contextInfo.mentionedJid || [];
    const isMentioned = mentionedJids.includes(botJid);
    const isMentionedToBot = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(botJid);
    const isReplyToBot = contextInfo?.quotedMessage && (contextInfo?.participant === botJid || contextInfo?.remoteJid === botJid);
    const isPrivate = !isGroup;

    if ((!isGroup || isMentioned) && !greetedUsers.has(userId)) {
      greetedUsers.add(userId);
      await botFirstResponse({ sock, sender, msg }, { botBehavior: { botName: 'AuraBot', botMenu: '/menu' } });
    }

    // ========== HANDLER TERPISAH ==========
    const staticHandled = await staticCommand(sock, msg, lowerText, userId, from, body);
    if (staticHandled) return;

    const menfessHandled = await menfess(sock, msg, text);
    if (menfessHandled) return;

    const cmdMap = new Map([
      [['.a'], () => addAdmin(sock, msg, sender, actualUserId, text)],
      [['.una'], () => removeAdmin(sock, msg, sender, actualUserId, text)],
      [['/listbahasa', '.listbahasa', 'list bahasa'], () => sock.sendMessage(sender, { text: listBahasa }, { quoted: msg })],
      [['/tl', '.tl', 'tl'], () => handleTranslate(sock, msg, text, command, args)],
      [['waifuhen'], () => waifuhen(sock, msg, args.join(' '))],
      [['.waifu'], () => waifu(sock, msg, args.join(' '))],
      [['.sm'], () => stickerToMedia(sock, msg)],
      [['.linkmap'], () => linkMap(sock, msg, text.split('.linkmap')[1]?.trim() || '')],
      [['.mapqr'], () => mapsQR(sock, msg, text.split('.mapqr')[1]?.trim() || '')],
      [['.qr'], () => handleQR(sock, msg)],
      [['.cqr'], () => buatQR(sock, msg, text.split('.cqr ')[1])],
      [['.show'], () => showOnce(sock, msg)],
      [['.sendAll'], async () => {
        const pesan = body.split(' ').slice(1).join(' ');
        if (!pesan) return sock.sendMessage(from, { text: '❌ Format: .sendAll isi pesan' }, { quoted: msg });
        await sock.sendMessage(from, { text: '🔄 Mengirim ke semua kontak...' }, { quoted: msg });
        await sendAll(sock, sender, pesan);
        await sock.sendMessage(from, { text: '✅ Pesan berhasil dikirim!' }, { quoted: msg });
      }],
      [['.dyts'], () => handleYTDownload(sock, msg, text)],
      [['.d'], () => handleTiktokVideo(sock, msg, text)],
      [['.ds'], () => handleTiktokAudio(sock, msg, text)],
      [['.dig'], () => handleInstagramVideo(sock, msg, text)],
      [['.kick'], () => kick(sock, msg, text, isGroup)],
      [['.tagall'], () => tagall(sock, msg, text, isGroup)],
      [['.add'], () => add(sock, msg, command, args, sender, userId)],
      [['stickertext', 'st'], async () => {
        if (!args[0]) return sock.sendMessage(sender, { text: 'Ketik: stikertext Halo dunia!' }, { quoted: msg });
        const stickerBuffer = await createStickerFromText(args.join(' '));
        await sock.sendMessage(sender, { sticker: stickerBuffer }, { quoted: msg });
      }],
      [['.reset'], async () => {
        if (!adminList.includes(actualUserId)) return sock.sendMessage(sender, { text: '❌ Hanya admin boleh reset ingatan AuraBot!' }, { quoted: msg });
        memoryMap.delete(actualUserId);
        await sock.sendMessage(sender, { text: '🧠 Ingatan AuraBot Telah Direset!' }, { quoted: msg });
      }]
    ]);

    for (const [triggers, action] of cmdMap.entries()) {
      if (triggers.includes(command)) return await action();
    }

    if (['s', 'sticker'].includes(lowerText)) {
      try {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const caption = msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || '';
        const captionMatch = ['s', 'sticker'].includes(caption.toLowerCase());

        if (quoted?.imageMessage || quoted?.videoMessage || captionMatch) {
          await createStickerFromMessage(sock, msg);
        } else {
          await sock.sendMessage(sender, { text: 'Kirim gambar lalu reply "s", atau kirim langsung dengan caption "s".' }, { quoted: msg });
        }
      } catch (err) {
        console.error('❌ Gagal buat stiker:', err);
        await sock.sendMessage(sender, { text: 'Gagal buat stiker 😖' }, { quoted: msg });
      }
      return;
    }

    if (text.startsWith('/') && !['/menu', '/reset', '/riwayat', '/clear'].includes(lowerText)) {
      return sock.sendMessage(sender, { text: 'Maaf, aku gak ngerti perintah itu 😵. Coba ketik /menu yaa!' }, { quoted: msg });
    }

    if (isMentionedToBot || isMentioned || isReplyToBot || isPrivate) {
      let query = '';
      const contextInfo = msg.message?.extendedTextMessage?.contextInfo || {};
      const quoted = contextInfo.quotedMessage;
      const quotedSender = contextInfo.participant || null;

      if (quoted && quotedSender !== botJid) {
        query = quoted.conversation || '[Media]';
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
          await sock.sendMessage(sender, { text: '⚠️ AI-nya error, coba nanti yaa!' }, { quoted: msg });
        }
      }
    }
  } catch (error) {
    console.error('❌ Error di handleResponder:', error);
  }
}

module.exports = {
  handleResponder,
  greetedUsers,
  botFirstResponse,
  registerGroupUpdateListener
};
