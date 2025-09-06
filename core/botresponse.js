// botresponse.js — FIX: tampilkan nomor 62… asli di grup
const { adminList } = require('../setting/setting')
const { botResponsePatterns } = require('../setting/botconfig')
const { handleStaticCommand } = require('../core/handler/staticCommand')
const { handleOpenAIResponder } = require('../core/utils/openai')
const menfess = require('../commands/menfess')
const { resolveJid, getDisplayNumber } = require("./utils/utils");

const spamTracker = new Map()
const mutedUsers = new Map()
const muteDuration = 2 * 60 * 1000

// —— Helpers ————————————————————————————————————————————

// Hapus suffix device (:1@), ubah @lid → @s.whatsapp.net
function cleanJid(jid = '') {
  return String(jid)
    .replace(/:.*@/g, '@')
    .replace('@lid', '@s.whatsapp.net')
}

// Resolve JID “aneh” (137xxx) → phone JID 62xxxx@s.whatsapp.net kalau bisa
async function resolvePhoneJid(sock, rawJid = '') {
  if (!rawJid) return ''

  // 1) decode + clean
  let jid = rawJid
  try {
    if (typeof sock.decodeJid === 'function') {
      jid = sock.decodeJid(jid) || jid
    }
  } catch {}
  jid = cleanJid(jid)

  // 2) kalau sudah 62…@s.whatsapp.net, selesai
  if (/^62\d+@s\.whatsapp\.net$/.test(jid)) return jid

  // 3) coba tanya ke WA: kasih JID langsung
  try {
    const result = await sock.onWhatsApp(jid)
    if (Array.isArray(result) && result[0]?.jid && /^62\d+@s\.whatsapp\.net$/.test(result[0].jid)) {
      return cleanJid(result[0].jid)
    }
  } catch {}

  // 4) coba lagi pakai bagian sebelum @ (angka mentah)
  try {
    const onlyNum = String(jid).split('@')[0]
    const result2 = await sock.onWhatsApp(onlyNum)
    if (Array.isArray(result2) && result2[0]?.jid && /^62\d+@s\.whatsapp\.net$/.test(result2[0].jid)) {
      return cleanJid(result2[0].jid)
    }
  } catch {}

  // 5) kalau masih gagal, ya sudah balikin yang ada (tetap bisa ke-mention)
  return jid
}

// Ambil nomor display murni digit 62… dari phone JID
function toDisplayNumber(phoneJid = '') {
  // contoh input: 62812xxxx@s.whatsapp.net → output: 62812xxxx
  return String(phoneJid).split('@')[0] || ''
}

// —— Handler utama —————————————————————————————————————

async function handleResponder(sock, msg) {
  try {
    if (!msg?.message) return
    const rawJid = msg.key.participant;
const userJid = await resolveJid(rawJid, sock);
const displayNum = await getDisplayNumber(rawJid, sock);

console.log("✅ Resolved JID:", userJid);
console.log("✅ Display Number:", displayNum);
    const from = msg.key.remoteJid // id chat (grup / private)
    const isGroup = from.endsWith('@g.us')

    // Cari pengirim sebenarnya (kalau grup pakai participant)
    const rawParticipant =
      msg.key.participant ||
      msg.participant ||
      msg.message?.extendedTextMessage?.contextInfo?.participant ||
      from

    // Resolve ke JID nomor 62… kalau bisa
    const resolvedPhoneJid = await resolvePhoneJid(sock, rawParticipant)
    const displayNumber = toDisplayNumber(resolvedPhoneJid) // <= ini yang kamu mau: 62xxxx
    const actualUserId = cleanJid(rawParticipant) // untuk mentions tetap pakai JID asli

    // Ambil teks isi pesan
    const content = msg.message?.viewOnceMessageV2?.message || msg.message
    const text =
      content?.conversation ||
      content?.extendedTextMessage?.text ||
      content?.imageMessage?.caption ||
      content?.videoMessage?.caption ||
      ''

    const body = text
    const command = body.trim().split(/\s+/)[0]?.toLowerCase() || ''
    const args = body.trim().split(/\s+/).slice(1)
    const lowerText = text.toLowerCase()
    const commandName = command

    // Debug biar jelas
    console.log('========================')
    console.log('📩 Pesan baru diterima')
    console.log('📌 isGroup:', isGroup)
    console.log('📌 msg.key.participant (raw):', msg.key?.participant)
    console.log('📌 rawParticipant:', rawParticipant)
    console.log('📌 resolvedPhoneJid (if any):', resolvedPhoneJid)
    console.log('✅ displayNumber (62…):', displayNumber)
    console.log('✅ actualUserId (mention JID):', actualUserId)
    console.log('========================')

    // 🚫 Anti spam untuk command (., /)
    if (body.startsWith('/') || body.startsWith('.')) {
      const now = Date.now()
      const userSpam = spamTracker.get(actualUserId) || []
      const filtered = userSpam.filter(t => now - t < 10000)
      filtered.push(now)
      spamTracker.set(actualUserId, filtered)

      if (filtered.length > 5 && !adminList.includes(actualUserId)) {
        mutedUsers.set(actualUserId, now + muteDuration)
        return sock.sendMessage(from, {
          text: '🔇 Kamu terlalu banyak mengirim command! Bot diam 2 menit.'
        }, { quoted: msg })
      }
    }

    // 📌 Cek command statis (kirim juga displayNumber & actualUserId biar bisa @mention + tampilan)
    const handledStatic = await handleStaticCommand(
      sock,
      msg,
      lowerText,
      body,
      { actualUserId, displayNumber }
    )
    if (handledStatic) return

    // 💌 Menfess
    const handledMenfess = await menfess(sock, msg, text)
    if (handledMenfess) return

    // 📣 Deteksi mention bot
    const botJid = cleanJid(sock.user?.id || '')
    const mentionedJidList = content?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const isMentioned = mentionedJidList.includes(botJid)

    // 🔄 Pola command lain
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

    // 🤖 AI responder (skip command tertentu)
    if (!['menu', 'reset', 'clear'].includes(commandName)) {
      // pakai actualUserId atau displayNumber sebagai key memory, bebas — aku pakai actualUserId
      await handleOpenAIResponder(sock, msg, actualUserId)
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
