const { adminList } = require('../setting/setting')
const { botResponsePatterns } = require('../setting/botconfig')
const { handleStaticCommand } = require('../core/handler/staticCommand')
const { handleOpenAIResponder } = require('../core/utils/openai')
const menfess = require('../commands/menfess')

const spamTracker = new Map()
const mutedUsers = new Map()
const muteDuration = 2 * 60 * 1000

// 🔹 Convert JID ke nomor +62
function jidToNumber(jid) {
  if (!jid) return ''
  const number = jid.split('@')[0]

  if (number.startsWith('62')) return `+${number}`
  if (number.startsWith('8')) return `+62${number}`
  return `+${number}`
}

async function handleResponder(sock, msg) {
  try {
    if (!msg.message) return

    const remoteJid = msg.key.remoteJid // JID chat (grup / pribadi)
    const isGroup = remoteJid.endsWith('@g.us')

    // 🔹 Ambil sender dengan aman
    let sender
    if (isGroup) {
      sender = msg.key.participant || msg.participant || null
    } else {
      sender = remoteJid
    }

    if (!sender) sender = sock.user?.id || "unknown@s.whatsapp.net"

    const userId = sender // asli, format jid
    const actualUserId = sender
    const displayNumber = jidToNumber(sender) // 🔹 untuk log / admin

    // 🔹 Log detail
    console.log("📩 Pesan baru diterima")
    console.log("📌 isGroup:", isGroup)
    console.log("📌 sender (jid):", sender)
    console.log("📌 sender (no):", displayNumber)
    console.log("📌 from:", remoteJid)
    console.log("✅ actualUserId:", actualUserId)

    const content = msg.message?.viewOnceMessageV2?.message || msg.message
    const text = content?.conversation ||
      content?.extendedTextMessage?.text ||
      content?.imageMessage?.caption ||
      content?.videoMessage?.caption || ''
    if (!text) return

    const body = text
    const lowerText = body.toLowerCase()
    const commandName = body.trim().split(' ')[0].toLowerCase().replace(/^\.|\//, '')
    const args = body.trim().split(' ').slice(1)

    // 🚫 Anti spam
    if (body.startsWith('/') || body.startsWith('.')) {
      const now = Date.now()
      const userSpam = spamTracker.get(userId) || []
      const filtered = userSpam.filter(t => now - t < 10000)
      filtered.push(now)
      spamTracker.set(userId, filtered)

      if (filtered.length > 5 && !adminList.includes(userId)) {
        mutedUsers.set(userId, now + muteDuration)
        return sock.sendMessage(remoteJid, {
          text: '🔇 Kamu terlalu banyak mengirim command! Bot diam 2 menit.'
        }, { quoted: msg })
      }
    }

    // 📌 Cek command static
    const handledStatic = await handleStaticCommand(sock, msg, lowerText, userId, displayNumber, body)
    if (handledStatic) return

    // 💌 Menfess
    const handledMenfess = await menfess(sock, msg, text)
    if (handledMenfess) return

    // 📣 Deteksi mention bot
    const botJid = sock.user?.id
    const mentionedJidList = content?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const isMentioned = mentionedJidList.includes(botJid)

    // 🔄 Loop pattern command
    for (const pattern of botResponsePatterns) {
      if (commandName !== pattern.command) continue

      if (['waifu', 'waifuhen'].includes(pattern.command)) {
        return await pattern.handler(sock, msg, body, args, pattern.command)
      }

      if (['na', 'una', 'admin'].includes(pattern.command)) {
        return await pattern.handler(sock, msg, text, actualUserId, displayNumber)
      }

      return await pattern.handler(sock, msg, body, args, commandName, displayNumber)
    }

    // 🤖 AI responder (skip untuk command tertentu)
    if (!['menu', 'reset', 'clear'].includes(commandName)) {
      await handleOpenAIResponder(sock, msg, displayNumber)
    }

  } catch (err) {
    console.error('❌ Error di handleResponder:', err)
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
