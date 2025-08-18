const path = require('path');
const { adminList } = require('../setting/setting')
const { botResponsePatterns } = require('../setting/botconfig')
const { handleStaticCommand } = require('../core/handler/staticCommand')
const { handleOpenAIResponder, memoryMap } = require('../core/utils/openai')
const menfess = require('../commands/menfess')

const spamTracker = new Map()
const mutedUsers = new Map()
const muteDuration = 2 * 60 * 1000

async function handleResponder(sock, msg) {
  try {
    if (!msg.message) return;

    // Pakai JID mentah langsung dari WhatsApp
    const sender = msg.key.remoteJid;
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

    // 🚫 Anti spam
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

    // 📌 Cek command static
    const handledStatic = await handleStaticCommand(sock, msg, lowerText, userId, sender, body);
    if (handledStatic) return;

    // 💌 Menfess
    const handledMenfess = await menfess(sock, msg, text)
    if (handledMenfess) return

    // 📣 Deteksi mention bot
    const botJid = sock.user?.id;
    const mentionedJidListRaw = content?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const mentionedJidList = mentionedJidListRaw;
    const isMentioned = mentionedJidList.includes(botJid);

    // 🔄 Loop pattern command
    for (const pattern of botResponsePatterns) {
      if (commandName !== pattern.command) continue;

      if (['waifu', 'waifuhen'].includes(pattern.command)) {
        if (args.length === 0) {
          return await pattern.handler(sock, msg, '', [], pattern.command);
        } else {
          return await pattern.handler(sock, msg, body, args, pattern.command);
        }
      }

      if (['na', 'una', 'admin'].includes(pattern.command)) {
        return await pattern.handler(sock, msg, text, actualUserId, sender);
      }

      return await pattern.handler(sock, msg, body, args, commandName, actualUserId);
    }

    // 🤖 AI responder (skip untuk command tertentu)
    if (!['menu', 'reset', 'clear'].includes(commandName)) {
      await handleOpenAIResponder(sock, msg, userId);
    }

  } catch (err) {
    console.error('❌ Error di handleResponder:', err);
  }
}

const registeredSockets = new WeakSet()

function registerGroupUpdateListener(sock) {
  if (registeredSockets.has(sock)) return
  registeredSockets.add(sock)

  sock.ev.removeAllListeners('group-participants.update')
  sock.ev.on('group-participants.update', async (update) => {
    const handleWelcome = require('../commands/welcome')
    await handleWelcome(sock, update)
  })
}

module.exports = {
  handleResponder,
  registerGroupUpdateListener
}
