const spamTracker = new Map()
const userStateMap = new Map()
const mutedUsers = new Map()
const memoryMap = new Map()
const muteDuration = 2 * 60 * 1000
const { handleStaticCommand } = require('../core/handler/staticCommand')
const buatGrup = require('../commands/buatGrup');
const { handleDynamicCommand } = require('../core/handler/handlecommand');
const menfess = require('../commands/menfess')

const greetedUsers = new Set()
// const lastCommandMap = new Map()
// const selectedNominalMap = new Map()
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')

async function botFirstResponse({ sock, sender, msg }, options = {}) {
  const botName = options.botBehavior?.botName || 'Bot'
  const botMenu = options.botBehavior?.botMenu || '/menu'
  const greetingText = `Halo! Saya *${botName}* 🤖.\nKetik *${botMenu}* untuk melihat menu yang tersedia yaa~`
  await sock.sendMessage(sender, { text: greetingText }, { quoted: msg })
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

    if (!text) return;

     const handledStatic = await handleStaticCommand(sock, msg, lowerText, userId, from, body)
      if (handledStatic) return

    // Anti-spam
   // Hanya hitung spam jika dia mengirim command (pakai / atau . di awal)
if (text.startsWith('/') || text.startsWith('.')) {
  const now = Date.now()
  const userSpam = spamTracker.get(userId) || []
  const filtered = userSpam.filter(t => now - t < 10000)
  filtered.push(now)
  spamTracker.set(userId, filtered)

  if (filtered.length > 5 && !adminList.includes(userId)) {
    mutedUsers.set(userId, now + muteDuration)
    return sock.sendMessage(sender, { text: '🔇 Kamu terlalu banyak mengirim command! Bot diam 2 menit.' }, { quoted: msg })
  }
}


    // Sapaan bot
    const botNumber = sock.user.id.split(':')[0]
    const botJid = botNumber.includes('@s.whatsapp.net') ? botNumber : `${botNumber}@s.whatsapp.net`
    const contextInfo = content?.extendedTextMessage?.contextInfo || {}
    const mentionedJids = contextInfo.mentionedJid || []
    const isMentioned = mentionedJids.includes(botJid)
    const isMentionedToBot = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(botJid)
    const isReplyToBot = contextInfo?.quotedMessage && (contextInfo?.participant === botJid || contextInfo?.remoteJid === botJid)
    const isPrivate = !sender.endsWith('@g.us')

    if ((!isGroup || isMentioned) && !greetedUsers.has(userId)) {
      greetedUsers.add(userId)
      await botFirstResponse({ sock, sender, msg }, {
        botBehavior: { botName: 'AuraBot', botMenu: '/menu' }
      })
    }
    const grupCreated = await buatGrup(sock, msg, text);
    if (grupCreated) return;

    const handledMenfess = await menfess(sock, msg, text)
    if (handledMenfess) return

    const handled = await handleDynamicCommand(sock, msg, text, command, args, from, sender, userId, actualUserId, isGroup);
    if (handled) return;

    
        const listBahasa = `🌐 *Daftar Kode Bahasa Umum:*
    
    🇮🇩 Indonesia — \`id\`  
    🇬🇧 Inggris — \`en\`  
    🇯🇵 Jepang — \`ja\`  
    🇰🇷 Korea — \`ko\`  
    🇨🇳 Mandarin — \`zh\`  
    🇫🇷 Prancis — \`fr\`  
    🇩🇪 Jerman — \`de\`  
    🇪🇸 Spanyol — \`es\`  
    🇷🇺 Rusia — \`ru\`  
    🇮🇳 Hindi — \`hi\`  
    🇹🇭 Thai — \`th\`  
    🇵🇹 Portugis — \`pt\`  
    🇮🇹 Italia — \`it\`  
    🇳🇱 Belanda — \`nl\`  
    🇹🇷 Turki — \`tr\`  
    🇵🇱 Polandia — \`pl\`  
    🇸🇦 Arab — \`ar\`  
    🇻🇳 Vietnam — \`vi\`  
    🇵🇭 Filipino — \`tl\`  
    🇮🇱 Ibrani — \`he\`  
    🇺🇦 Ukraina — \`uk\`
    
    📌 *Gunakan dengan perintah:*  
    \`/tl <kode> <teks>\`  
    Contoh: \`/tl en Saya lapar\` → akan diterjemahkan ke Inggris.
    
    ✨ *Ketik sesuai yaa! Hindari typo biar nggak nyasar 😋*
    `


    if (['/listbahasa', '.listbahasa', 'listbahasa', 'list bahasa'].includes(lowerText)) {
      return sock.sendMessage(sender, {
        text: listBahasa,
      }, { quoted: msg });
    }

    if (text === '.reset') {
      if (!adminList.includes(actualUserId)) {
        return sock.sendMessage(sender, {
          text: '❌ Maaf, hanya admin yang boleh reset ingatan AuraBot 🙅‍♂️'
        }, { quoted: msg });
      }

      memoryMap.delete(actualUserId)
      return sock.sendMessage(sender, {
        text: '🧠 Ingatan AuraBot Telah Direset, Ayo Buat Obrolan Baru~!'
      }, { quoted: msg });
    }

      if (text.startsWith('/') && !['/menu', '/reset', '/riwayat', '/clear'].includes(lowerText)) {
      return sock.sendMessage(sender, {
        text: 'Maaf, aku gak ngerti perintah itu 😵. Coba ketik /menu yaa!'
      }, { quoted: msg });
    }

    // 🧠 INI BLOK AI ChatGPT HARUS DI DALAM SINI:
    if (isMentionedToBot || isMentioned || isReplyToBot || isPrivate) {
      let query = ''
      const msgContent = msg.message
      const contextInfo = msgContent?.extendedTextMessage?.contextInfo || {}
      const quoted = contextInfo.quotedMessage
      const quotedSender = contextInfo.participant || null
      const botNumber = sock.user.id.split(':')[0]
      const botJid = botNumber.includes('@s.whatsapp.net') ? botNumber : `${botNumber}@s.whatsapp.net`

      if (quoted && quotedSender !== botJid) {
        if (quoted.conversation) {
          query = quoted.conversation
        } else if (quoted.imageMessage) {
          query = '[Gambar dikirim]'
        } else if (quoted.videoMessage) {
          query = '[Video dikirim]'
        } else if (quoted.locationMessage) {
          const loc = quoted.locationMessage
          query = `📍 Lokasi dikirim:\nLatitude: ${loc.degreesLatitude}, Longitude: ${loc.degreesLongitude}`
          if (loc.name) query += `\n🗺️ Nama Lokasi: ${loc.name}`
          if (loc.address) query += `\n🏠 Alamat: ${loc.address}`
        } else {
          query = '[Pesan tidak dikenali]'
        }
      } else {
        query =
          msgContent?.conversation ||
          msgContent?.extendedTextMessage?.text ||
          msgContent?.imageMessage?.caption ||
          msgContent?.videoMessage?.caption ||
          ''
      }

      if (query?.trim()) {
        try {
          await sock.sendPresenceUpdate('composing', sender)

          const history = memoryMap.get(userId) || []
          history.push({ role: 'user', content: query })

          const quotedText = quoted?.conversation ||
                    quoted?.extendedTextMessage?.text ||
                    quoted?.imageMessage?.caption ||
                    quoted?.videoMessage?.caption || ''

          const aiReply = await askOpenAI(history, quotedText)
          history.push({ role: 'assistant', content: aiReply })
          memoryMap.set(userId, history.slice(-15))

          return sock.sendMessage(sender, { text: aiReply }, { quoted: msg })
        } catch (err) {
          console.error('❌ Gagal respon AI:', err)
          return sock.sendMessage(sender, {
            text: '⚠️ Maaf, AI-nya lagi error nih~ coba beberapa saat lagi ya!',
          }, { quoted: msg })
        }
      }
    }

  } catch (error) {
    console.error('❌ Error di handleResponder:', error)
  }
}

const registeredSockets = new WeakSet()

function registerGroupUpdateListener(sock) {
  if (registeredSockets.has(sock)) return
  registeredSockets.add(sock)

  sock.ev.removeAllListeners('group-participants.update')
  sock.ev.on('group-participants.update', async (update) => {
    console.log('[👥] Event grup masuk:', update.action, update.participants)
    await handleWelcome(sock, update)
  })

  console.log('[✅] Listener grup berhasil didaftarkan')
}



module.exports = {
  handleResponder,
  greetedUsers,
  botFirstResponse,
  registerGroupUpdateListener
}
