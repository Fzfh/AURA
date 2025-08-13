const path = require('path');
const { adminList } = require('../setting/setting');
const { botResponsePatterns } = require('../setting/botconfig');
const { handleStaticCommand } = require('../core/handler/staticCommand');
const { handleOpenAIResponder, memoryMap } = require('../core/utils/openai');
const menfess = require('../commands/menfess');

const spamTracker = new Map();
const mutedUsers = new Map();
const muteDuration = 2 * 60 * 1000;

async function handleResponder(sock, msg) {
  try {
    if (!msg.message) return;

    const sender = (msg.key.participant || msg.key.remoteJid || '').replace(/:\d+/, '')
// Normalisasi semua ID ke format @s.whatsapp.net kalau private
const jidNormalized = sender.includes('@lid')
    ? sender.replace('@lid', '@s.whatsapp.net')
    : sender

    const userId = sender;
    const actualUserId = msg.key.participant || sender;
    const isGroup = sender.endsWith('@g.us');

    const content = msg.message?.viewOnceMessageV2?.message || msg.message;
    const text = content?.conversation ||
                 content?.extendedTextMessage?.text ||
                 content?.imageMessage?.caption ||
                 content?.videoMessage?.caption || '';
    if (!text) return;

    const body = text;
    const lowerText = text.toLowerCase();
    const commandName = body.trim().split(' ')[0].toLowerCase().replace(/^\.|\//, '');
    const args = body.trim().split(' ').slice(1);

    // Ambil list mention di pesan
    const mentionedJidList = content?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const botJid = sock.user?.id;
    const isMentioned = mentionedJidList.includes(botJid);

    // Spam filter hanya untuk command
    if (text.startsWith('/') || text.startsWith('.')) {
      const now = Date.now();
      const userSpam = spamTracker.get(userId) || [];
      const filtered = userSpam.filter(t => now - t < 10000);
      filtered.push(now);
      spamTracker.set(userId, filtered);
      if (filtered.length > 5 && !adminList.includes(userId)) {
        mutedUsers.set(userId, now + muteDuration);
        return sock.sendMessage(sender, {
          text: '🔇 Kamu terlalu banyak mengirim command! Bot diam 2 menit.'
        }, { quoted: msg });
      }
    }

    // Cek static command
    const handledStatic = await handleStaticCommand(sock, msg, lowerText, userId, sender, body);
    if (handledStatic) return;

    // Cek menfess
    const handledMenfess = await menfess(sock, msg, text);
    if (handledMenfess) return;

    // Cek botResponsePatterns
    for (const pattern of botResponsePatterns) {
      if (commandName !== pattern.command) continue;

      if (['waifu', 'waifuhen'].includes(pattern.command)) {
        return await pattern.handler(sock, msg, body, args, pattern.command);
      }

      if (['na', 'una', 'admin'].includes(pattern.command)) {
        const targetId = mentionedJidList.length > 0 ? mentionedJidList[0] : actualUserId;
        return await pattern.handler(sock, msg, text, targetId, sender);
      }

      return await pattern.handler(sock, msg, body, args, commandName, actualUserId);
    }

    // AI Responder di grup hanya aktif kalau bot di-mention
    if (!['menu', 'reset', 'clear'].includes(commandName)) {
      if (!isGroup || isMentioned) {
        await handleOpenAIResponder(sock, msg, userId);
      }
    }

  } catch (err) {
    console.error('❌ Error di handleResponder:', err);
  }
}

const registeredSockets = new WeakSet();

function registerGroupUpdateListener(sock) {
  if (registeredSockets.has(sock)) return;
  registeredSockets.add(sock);

  sock.ev.removeAllListeners('group-participants.update');
  sock.ev.on('group-participants.update', async (update) => {
    const handleWelcome = require('../commands/welcome');
    await handleWelcome(sock, update);
  });
}

module.exports = {
  handleResponder,
  registerGroupUpdateListener
};
