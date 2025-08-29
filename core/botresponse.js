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

  // Long JID (137xxx) → return mentah biar ga nyasar ke +1xxx
  if (!/^\d+$/.test(number)) return jid

  if (number.startsWith('62')) return `+${number}`
  if (number.startsWith('8')) return `+62${number}`
  return `+${number}`
}

// 🔹 Normalisasi JID biar gak jadi long JID (137xxx)
async function normalizeJid(sock, jid) {
  if (!jid) return ''

  // Kalau sudah format normal (62xxx@s.whatsapp.net) → langsung return
  if (jid.startsWith('62') && jid.endsWith('@s.whatsapp.net')) {
    return jid
  }

  try {
    const [result] = await sock.onWhatsApp(jid)
    if (result && result.jid) {
      return result.jid // contoh: 6289532xxxx@s.whatsapp.net
    }
  } catch (e) {
    console.error("❌ Gagal resolve JID:", e)
  }

  return jid // fallback kalau gagal
}

async function handleResponder(sock, msg) {
  try {
    if (!msg.message) return
    const sender = msg.key.remoteJid
    const userId = sender
    const from = sender
    const actualUserId =
    msg.key.participant ||
    msg.participant ||
    msg.message?.extendedTextMessage?.contextInfo?.participant ||
    sender
    const isGroup = sender.endsWith('@g.us')

    const content = msg.message?.viewOnceMessageV2?.message || msg.message
    const text =
      content?.conversation ||
      content?.extendedTextMessage?.text ||
      content?.imageMessage?.caption ||
      content?.videoMessage?.caption || ''

    const body = text
    const command = body.trim().split(' ')[0].toLowerCase()
    const args = body.trim().split(' ').slice(1)
    const lowerText = text.toLowerCase()

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
