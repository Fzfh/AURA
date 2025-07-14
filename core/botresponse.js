const spamTracker = new Map()
const userStateMap = new Map()
const mutedUsers = new Map()
const memoryMap = new Map()
const muteDuration = 2 * 60 * 1000
const add = require('../commands/add');
// const { handleAutoKick } = require('../commands/auto_kick')
const { handleStaticCommand } = require('../core/handler/staticCommand')
const tagall = require('../commands/tagall')
const kick = require('../commands/kick')
const menfess = require('../commands/menfess')
const handleWelcome = require('../commands/welcome');
const { adminList, toxicWords } = require('../setting/setting')
const askOpenAI = require('../core/utils/openai')
const { createStickerFromMessage, createStickerFromText, stickerTextCommand, stickerFromMediaCommand } = require('../core/stickerHelper')
const downloadTiktok = require('../commands/tiktokDownloader');
const downloadInstagram = require('../commands/igDownloader');
const downloadYouTubeMP3 = require('../commands/youtubeDownloader');;
const sendAll = require('../commands/sendAll');
const showOnce = require('../commands/show');
const handleQR = require('../commands/qris')
const buatQR = require('../commands/createQr')
const mapsQR = require('../commands/mapqr');
const linkMap = require('../commands/linkmap');
const waifuhen = require('../commands/waifuhen')
const waifu = require('../commands/waifu')
const stickerToMedia = require('../commands/stickerToMedia');
const handleTranslate = require('../commands/translate');
const admin = require('../commands/admin');
const buatGrup = require('../commands/buatGrup');
const ekstrakAudio = require('../commands/ekstrakAudio');
const openCloseGroup = require('../commands/openCloseGroup');

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

    if (await kick(sock, msg, text, isGroup)) return;
    if (await add(sock, msg, text, sender, userId)) return;
    if (await openCloseGroup(sock, msg, text)) return;
    if (await admin(sock, msg, text, actualUserId, userId)) return;
    if (await stickerTextCommand(sock, msg, lowerText, args)) return;
    if (await stickerFromMediaCommand(sock, msg, lowerText)) return;

    
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

    if (command === '/tl' || command === '.tl' || command === 'tl') {
      return await handleTranslate(sock, msg, text, command, args);
    }

    if (command === 'waifuhen') {
      return await waifuhen(sock, msg, args.join(' '));
    }


    if (command === '.waifu') {
      return await waifu(sock, msg, args.join(' '));
    }

    if (lowerText.startsWith('.sm') || lowerText.startsWith('sm')) {
      await stickerToMedia(sock, msg);
      return;
    }
    
    if (lowerText.startsWith('.linkmap') || lowerText.startsWith('linkmap')) {
      const isi = text.replace(/^\.*linkmap/i, '').trim();
      return await linkMap(sock, msg, isi);
    }

   if (lowerText.startsWith('.mapqr') || lowerText.startsWith('mapqr')) {
      const isi = text.replace(/^\.*mapqr/i, '').trim();
      return await mapsQR(sock, msg, isi);
    }


    if (lowerText.startsWith('.qr')) {
      return await handleQR(sock, msg);
    }
    
    if (lowerText.startsWith('.cqr ') || lowerText.startsWith('cqr ')) {
      const isiTeks = text.replace(/^\.*cqr/i, '').trim();
      return await buatQR(sock, msg, isiTeks)
    }

    if (lowerText.startsWith('.show') || lowerText.startsWith('show')) {
      return await showOnce(sock, msg);
    }
    if (body.startsWith('.sendAll')) {
      const pesan = body.split(' ').slice(1).join(' ');
      if (!pesan) return sock.sendMessage(from, { text: '❌ Format: .sendAll isi pesan' }, { quoted: msg });
    
      await sock.sendMessage(from, { text: '🔄 Mengirim ke semua kontak yang 1 grup...' }, { quoted: msg });
      await sendAll(sock, sender, pesan);
      await sock.sendMessage(from, { text: '✅ Pesan berhasil dikirim!' }, { quoted: msg });
    }
    
    if (
      body.trim().toLowerCase() === 'ets' &&
      (
        msg.message?.videoMessage ||
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage
      )
    ) {
      return await ekstrakAudio(sock, msg);
    }
    
          if (text.startsWith('.d ')) {
          const link = text.split(' ')[1];
          
          if (!link || !link.includes('tiktok.com')) {
            await sock.sendMessage(from, {
              text: '❌ Link TikTok tidak valid!',
            }, { quoted: msg });
            return;
          }
        
          await sock.sendMessage(from, {
            text: '⏳ Sedang memproses link TikTok...',
          }, { quoted: msg });
        
          try {
            const result = await downloadTiktok(link);
        
            if (!result) {
              await sock.sendMessage(from, {
                text: '❌ Gagal mengambil data dari TikTok.',
              }, { quoted: msg });
              return;
            }
        
            if (result.isPhoto && result.images.length > 0) {
              await sock.sendMessage(from, {
                text: '📷 Link kamu adalah Foto. ⬇️ Sedang Mengunduh...',
              }, { quoted: msg });
        
              for (const imageUrl of result.images) {
                await sock.sendMessage(from, {
                  image: { url: imageUrl },
                }, { quoted: msg });
              }
        
            } else if (result.videoUrl) {
              await sock.sendMessage(from, {
                text: '🎞️ Link kamu adalah video. ⬇️ Sedang Mengunduh...',
              }, { quoted: msg });
        
              await sock.sendMessage(from, {
                video: { url: result.videoUrl },
              }, { quoted: msg });
        
            } else {
              await sock.sendMessage(from, {
                text: '❌ Tidak ada media yang bisa diunduh dari link ini, Pastikan Link nya benar.',
              }, { quoted: msg });
            }
        
          } catch (e) {
            console.error('❌ Error TikTok:', e);
            await sock.sendMessage(from, {
              text: '⚠️ Terjadi kesalahan saat memproses link TikTok.',
            }, { quoted: msg });
          }
        
          return;
        }

        if (text.startsWith('.ds ')) {
          const link = text.split(' ')[1]
        
          if (!link || !link.includes('tiktok.com')) {
            await sock.sendMessage(from, { text: '❌ Link TikTok tidak valid!' }, { quoted: msg })
            return
          }
        
          await sock.sendMessage(from, { text: '🎧 Mengunduh sound TikTok...' }, { quoted: msg })
        
          try {
            const result = await downloadTiktok(link)
            if (!result || !result.musicUrl) {
              await sock.sendMessage(from, { text: '❌ Gagal mengunduh sound.' }, { quoted: msg })
              return
            }
        
            await sock.sendMessage(from, {
              audio: { url: result.musicUrl },
              mimetype: 'audio/mp4'
            }, { quoted: msg })
          } catch (e) {
            console.error('❌ Error:', e)
            await sock.sendMessage(from, { text: '⚠️ Error saat unduh sound.' }, { quoted: msg })
          }
        
          return
        }


        if (text.startsWith('.dig ')) {
      const link = text.split(' ')[1];
    
      if (!link || !link.includes('instagram.com')) {
        await sock.sendMessage(from, { text: '❌ Link Instagram tidak valid!' }, { quoted: msg });
        return;
      }
    
      await sock.sendMessage(from, { text: '⏳ Sedang mengunduh video Instagram...' }, { quoted: msg });
    
      try {
        const result = await downloadInstagram(link);
        if (!result || !result.videoUrl) {
          await sock.sendMessage(from, { text: '❌ Gagal mengunduh video Instagram.' }, { quoted: msg });
          return;
        }
    
        await sock.sendMessage(from, {
          video: { url: result.videoUrl }
        }, { quoted: msg });
      } catch (e) {
        console.error('❌ Error IG:', e);
        await sock.sendMessage(from, { text: '⚠️ Terjadi kesalahan saat mengunduh Instagram.' }, { quoted: msg });
      }
    
      return;
    }

    if (lowerText.startsWith('.tagall') || lowerText.startsWith('tagall') || lowerText.startsWith('tag semua') || lowerText.startsWith('tag')) {
      return await tagall(sock, msg, text, isGroup);
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
      return sock.sendMessage(sender, { text: 'Maaf, aku gak ngerti perintah itu 😵. Coba ketik /menu yaa!' }, { quoted: msg })
    }
    
if (isMentionedToBot || isMentioned || isReplyToBot || isPrivate) {
  let query = ''
  const msgContent = msg.message
  const contextInfo = msgContent?.extendedTextMessage?.contextInfo || {}
  const quoted = contextInfo.quotedMessage
  const quotedSender = contextInfo.participant || null
  const botNumber = sock.user.id.split(':')[0]
  const botJid = botNumber.includes('@s.whatsapp.net') ? botNumber : `${botNumber}@s.whatsapp.net`

  //  Jika reply tapi bukan reply ke bot
if (quoted && quotedSender !== botJid) {
  if (quoted.conversation) {
    query = quoted.conversation;
  } else if (quoted.imageMessage) {
    query = '[Gambar dikirim]';
  } else if (quoted.videoMessage) {
    query = '[Video dikirim]';
  } else {
    query = '[Pesan tidak dikenali]';
  }
} else {
  // Kalau bukan reply, ambil dari isi biasa
  query =
    msgContent?.conversation ||
    msgContent?.extendedTextMessage?.text ||
    msgContent?.imageMessage?.caption ||
    msgContent?.videoMessage?.caption ||
    '';
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
