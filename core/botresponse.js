const { handleOpenAIResponder } = require('../core/utils/openai')
const { botResponsePatterns } = require('../setting/botconfig')
const { adminList, logReceivers } = require('../setting/setting')
const { handleStaticCommand } = require('../core/handler/staticCommand')

const spamTracker = new Map()
const mutedUsers = new Map()
const muteDuration = 2 * 60 * 1000

async function handleResponder(sock, msg) {
  try {
    if (!msg.message) return;

    const sender = msg.key.remoteJid;
    const actualUserId = msg.key.participant || sender;
    const isGroup = sender.endsWith('@g.us');
    const userId = sender;

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

    let botReply = '';

    // 🚫 Anti-spam
    if (text.startsWith('/') || text.startsWith('.')) {
      const now = Date.now();
      const userSpam = spamTracker.get(userId) || [];
      const filtered = userSpam.filter(t => now - t < 10000);
      filtered.push(now);
      spamTracker.set(userId, filtered);
      if (filtered.length > 5 && !adminList.includes(userId)) {
        mutedUsers.set(userId, now + muteDuration);
        botReply = '🔇 Kamu terlalu banyak mengirim command! Bot diam 2 menit.';
        await sock.sendMessage(sender, { text: botReply }, { quoted: msg });
        await sendLog(sock, sender, body, botReply, isGroup, msg);
        return;
      }
    }

    // 📦 Static Command
    const staticReply = await handleStaticCommand(sock, msg, lowerText, userId, sender, body);
    if (staticReply) {
      botReply = staticReply;
      await sock.sendMessage(sender, { text: botReply }, { quoted: msg });
      await sendLog(sock, sender, body, botReply, isGroup, msg);
      return;
    }

    // 🎯 Custom Command Pattern
    for (const pattern of botResponsePatterns) {
      if (commandName !== pattern.command) continue;
      let replyText = '';

      if (['waifu', 'waifuhen'].includes(pattern.command)) {
        replyText = await pattern.handler(sock, msg, body, args, commandName);
      } else if (['na', 'una', 'admin'].includes(pattern.command)) {
        replyText = await pattern.handler(sock, msg, text, actualUserId, sender);
      } else {
        replyText = await pattern.handler(sock, msg, body, args, commandName);
      }

      if (replyText) {
        botReply = replyText;
        await sock.sendMessage(sender, { text: botReply }, { quoted: msg });
        await sendLog(sock, sender, body, botReply, isGroup, msg);
      }
      return;
    }

    // 🤖 AI Response
    if (!['menu', 'reset', 'clear'].includes(commandName)) {
      const aiReply = await handleOpenAIResponder(sock, msg, userId);
      if (aiReply) {
        botReply = aiReply;
        await sock.sendMessage(sender, { text: botReply }, { quoted: msg });
        await sendLog(sock, sender, body, aiReply, isGroup, msg);
      }
      return;
    }

  } catch (err) {
    console.error('❌ Error di handleResponder:', err);
  }
}

// 💌 Kirim Log ke Admin
async function sendLog(sock, sender, userMsg, botReply, isGroup, msg) {
  const groupName = isGroup && msg.pushName ? msg.pushName : '-';
  const time = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  const formatted = `📋 *Log Obrolan Bot*\n` +
    `🕒 Waktu: ${time}\n` +
    `📍 Dari: ${sender}${isGroup ? `\n👥 Grup: ${groupName}` : ''}\n` +
    `📝 Pesan: ${userMsg}\n` +
    `🤖 Balasan:\n${botReply || 'Tanpa balasan'}`;

  for (const admin of logReceivers) {
    await sock.sendMessage(admin, { text: formatted });
  }
}

// 🎉 Listener Welcome
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
