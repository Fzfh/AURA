const { adminList } = require('../../setting/setting')
const add = require('../../commands/add');
const tagall = require('../../commands/tagall')
const kick = require('../../commands/kick')
const menfess = require('../../commands/menfess')
const { createStickerFromMessage, createStickerFromText } = require('../stickerHelper')
const downloadTiktok = require('../../commands/tiktokDownloader');
const downloadInstagram = require('../../commands/igDownloader');
const downloadYouTubeMP3 = require('../../commands/youtubeDownloader');;
const sendAll = require('../../commands/sendAll');
const showOnce = require('../../commands/show');
const handleQR = require('../../commands/qris')
const buatQR = require('../../commands/createQr')
const mapsQR = require('../../commands/mapqr');
const linkMap = require('../../commands/linkmap');
const waifuhen = require('../../commands/waifuhen')
const waifu = require('../../commands/waifu')
const stickerToMedia = require('../../commands/stickerToMedia');
const handleTranslate = require('../../commands/translate');
const { addAdmin, removeAdmin } = require('../../commands/admin');
const buatGrup = require('../../commands/buatGrup');
const ekstrakAudio = require('../../commands/ekstrakAudio');
const openCloseGroup = require('../../commands/openCloseGroup');
async function handleStaticCommand(sock, msg, lowerText, userId, from, body, text, command, args) {
  const from = msg.key.remoteJid
  const sender = from
  const actualUserId = msg.key.participant || msg.participant || userId;
  
  switch (lowerText) {
    case '/menu':
    case 'menu':
    case '.menu':
      await sock.sendMessage(sender, {
       text: `╭━━━[ ✨ AURA BOT MENU ✨ ]━━━╮  
┃  
┃  🖼 Sticker dari Gambar/Video  
┃   ➤ Kirim media (foto/video)  
┃   ➤ Tambahkan caption: \`s\` atau \`sticker\`
┃  
┃  ⬆️ Ambil Sticker Jadi Media
┃   ➤ Reply Ke sticker ketik \`.sm\` 
┃   ➤ Media akan didownload
┃  
┃  ✍ Sticker dari Teks  
┃   ➤ Ketik: \`stickertext\` teks  
┃   ➤ Contoh: \`stickertext\` AuraBot  
┃  
┃  🎵 Ekstrak Audio dari Video
┃   ➤ Kirim video dengan caption: \`ets\`
┃   ➤ Atau reply ke video lalu ketik: \`ets\`
┃  
┃  💌 Menfess Anonim  
┃   ➤ \`/menfess\` 
┃  
┃  🗺️ Cari Lokasi Google Maps
┃   ➤ \`.linkmap\` <nama daerah> 
┃   ➤ Contoh: \`.linkmap\` monas Jakarta
┃   ➤ Reply Ke shareloc untuk jadi link
┃
┃  🗺️🎛️ Cari Lokasi Google Maps ke qr code (qris)
┃   ➤ \`.mapqr\` atau \`mapqr\` <nama daerah> 
┃   ➤ Contoh: \`.mapqr\` atau \`mapqr\` monas Jakarta
┃   ➤ Reply Ke shareloc untuk jadi link
┃
┃  👰🏻 Cari Waifu Kamu!
┃   ➤ \`.waifu\` <jenis waifu>
┃   ➤ Contoh: \`.waifu\` neko
┃
┃ ⬇ Download VT Tiktok (Foto & Video)
┃   ➤ \`.d\` link tiktok 
┃   ➤ Contoh: .d https://tiktok.com/linkKamu  
┃ 
┃ ⬇ Download Sound VT Tiktok  
┃   ➤ \`.ds\` link tiktok  
┃   ➤ Contoh: \`.ds\` https://tiktok.com/linkKamu  
┃   
┃ ⬇ Download Reels Instagram  
┃  *IG DOWNLOAD 1 MENIT, JANGAN SPAM!*
┃   ➤ \`.dig\` link instagram 
┃   ➤ Contoh: \`.dig\` https://instagram.com/linkKamu
┃ 
┃ 🎛️ Baca isi Qris
┃   ➤ \`.qr\` 
┃   ➤ Contoh: \`.qr\` reply ke qr code
┃   ➤ bisa juga hanya \`qr\`
┃ 
┃ 🌐 Translate Semua Bahasa
┃   ➤ /tl <kode bahasa> <teks>
┃   *CONTOH*
┃   ➤ /tl en halo dunia
┃   ➤ Bisa juga .tl atau tl
┃ 
┃ 🌐 List Kode Bahasa
┃   ➤ /listbahasa
┃   ➤ .listbahasa
┃   ➤ listbahasa
┃  
┃ 🤖 Beli Bot WA  
┃   ➤ beli bot — Lihat harga & fitur bot  
┃  
┃ ❓ BINGUNG?? KETIK COMMAND INI AJA!!  
┃   ➤ tutorial / tutor  
┃   ➤ admin Bot — Hubungi langsung via WA  
╰━━━━━━━━━━━━━━━━━━━━━━━╯  

╭━[ 🔒 KHUSUS ADMIN GRUP ]━╮  
┃  📸 Ambil Foto/video Sekali lihat
┃   ➤ \`.show\` atau show
┃   ➤ Contoh: \`.show\` lalu reply ke foto/video 1x lihat  
┃
┃  🔒 Open & Close Group
┃   ➤ Open: \`.open\`
┃   ➤ Close: \`.close\`
┃
┃  ⤴️ Promote Member jadi Admin
┃   ➤ \`.na\` reply ke user atau tag
┃   ➤ Contoh: \`.na\` @aurabot atau reply
┃
┃  ⤵️ Demote Admin jadi Member
┃   ➤ \`.una\` reply ke user atau tag
┃   ➤ Contoh: \`.una\` @aurabot atau reply
┃
┃  👤 Tambah Member
┃   ➤ tambah, add,
┃   ➤ tambah <nomor>
┃   ➤ contoh: tambah 628787
┃   ➤ contoh: add 628787
┃
┃  👥 Tag Semua Member Grup  
┃   ➤ \`.tagall\`  
┃   ➤ Contoh: .tagall Halo semua  
┃  
┃  🧾 Buat QR Code dengan Logo  
┃   ➤ \`.cqr\` isi teks  
┃   ➤ Contoh: \`.cqr\` halo dunia  
┃  
┃  🏗️ Buat Grup Baru via Bot  
┃   ➤ .bg <nama grup>  
┃   ➤ Contoh: \`.bg auragrup\`  
┃   ➤ Tambah member langsung:  
┃   ➤ \`.bg auragrup add 62812345, 62854321\`  
╰━━━━━━━━━━━━━━━━━━━━━━╯  

💡Kalau Kamu admin di grup maka kamu bisa menikmati semua fitur ya!
🧠 Ketik sesuai menu ya adick-adickk!  
📌 Hindari typo biar AURABOT gak Misskom 🤖🔥
`
      }, { quoted: msg })
      return true

    case 'tutorial':
    case 'tutor':
    case 'Tutorial':
    case 'Tutor':
    case 'Tutpr':
    case 'Titor':
    case 'Tytor':
    case 'caranya':
    case 'cara nya':
      await sock.sendMessage(sender, {
        text: `╭━━━[ *PANDUAN PENGGUNAAN* ]━━━╮

🎨 *1. Bikin Stiker dari Teks!*
   ➤ Ketik: *stickertext* (teks kamu)
   ➤ Atau pakai singkatan: *st* hello world!
   ➤ Contoh: *stickertext Halo Auraa!*
===========================
🖼️ *2. Bikin Stiker dari Foto/Video*
   ➤ Kirim foto/video dengan caption: *s* atau *sticker*
   ➤ Atau reply media dengan "s" untuk mengubah jadi stiker otomatis!
===========================
👩‍🎨 *3. Cari Waifu Lucu~*
   ➤ Ketik: *.waifu* (kategori/nama waifu)
   ➤ Contoh: *.waifu kamisato-ayaka*
===========================
💌 *4. Kirim Menfess Anonim*
   ➤ Ketik: */menfess*
   ➤ Isi nomor tujuan & isi pesan
   ➤ Ketik: */batal* untuk membatalkan
===========================
🎞️ *5. Download Video & Musik*
   🎵 *TikTok*
      ➤ *.d* — otomatis deteksi foto/video
      ➤ *.ds* — hanya musik
   📷 *Instagram*
      ➤ *.dig* + link

🔗 *Contoh:* .d https://vt.tiktok.com/abc123
===========================
🗺️ *6. Cari Atau Generate Lokasi*
    *Cari Lokasi*
    ➤ .linkmap (nama daerah)
    ➤ contoh: .linkmap Monas Jakarta

    *Reply Ke shareloc*
    ➤ Reply shareloc dan ketik .linkmap untuk generate link ke google maps
===========================
⬆️ *7. Ambil Sticker Jadi Media*
    *Untuk Mengambil Sticker*
    ➤ Ketik .sm lalu reply ke sticker kamu
===========================
🎛️ *8. Buat qris*
    *Untuk membuat qris cukup ketik \`.cqr\` <teks>
    ➤ Ketik: \`.cqr\` <teks>
    ➤ contoh: \`.cqr\` hello world
===========================
🎵 *9. Ekstrak Audio dari Video*
    *Untuk meng convert dari video ke mp3 bisa dengan command \`ets\`*
    ➤ Ketik: \`ets\` reply ke video atau kirim video dengan caption \`ets\`
===========================
🚪 *8. Keluar Sesi*
   ➤ Ketik: */keluar* untuk akhiri sesi fitur

╰━━━━━━━━━━━━━━━━━━━━━━━╯
✨ *Selamat Menikmati Fitur AuraBot yaaa* ✨`
      }, { quoted: msg })
      return true

    case 'admin':
      await sock.sendMessage(sender, {
        text: `👩‍💻 *Hubungi Admin AURA BOT:*\n\n📞 wa.me/62895326679840\n🕐 Online: 09.00 - 22.00 WIB\n\nButuh bantuan? hubungi admin aja yaa! Fast Respon! ✨`
      }, { quoted: msg })
      return true

    case 'beli bot':
      await sock.sendMessage(sender, {
        text: `🤖 *Harga Bot AURA:*\n• Premium - Rp70.000\n• Responder - Rp50.000`
      }, { quoted: msg })
      return true
  }
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
    if (text.startsWith('.open') || text.startsWith('.close')) {
      return await openCloseGroup(sock, msg, command);
    }

    if (lowerText.startsWith('.na')) {
      return await addAdmin(sock, msg, sender, actualUserId, text);
    }

    if (lowerText.startsWith('.una')) {
      return await removeAdmin(sock, msg, sender, actualUserId, text);
    }

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


    if (lowerText.startsWith('.qr') || lowerText.startsWith('qr')) {
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
    
    if (lowerText.startsWith('kick') || lowerText.startsWith('kik') || lowerText.startsWith('.kick') || lowerText.startsWith('.kik')) {
      return await kick(sock, msg, text, isGroup);
    }

    if (lowerText.startsWith('.tagall') || lowerText.startsWith('tagall') || lowerText.startsWith('tag semua') || lowerText.startsWith('tag')) {
      return await tagall(sock, msg, text, isGroup);
    }

    if (
      lowerText.startsWith('.add') ||
      lowerText.startsWith('add') ||
      lowerText.startsWith('tambah')
    ) {
      const raw = text.split(' ').slice(1).join(' ');
      const nomorList = raw.split(',').map(n => {
        let num = n.trim();
        if (num.startsWith('0')) num = '62' + num.slice(1);
        return num;
      });
      return await add(sock, msg, nomorList, sender, userId);
    }
    



   if (['s', 'sticker'].includes(lowerText)) {
      try {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const hasMediaQuoted = quoted?.imageMessage || quoted?.videoMessage

        const hasMediaDirect = msg.message?.imageMessage || msg.message?.videoMessage
        const caption = msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || ''

        // Kalau pakai caption langsung "s"
        const captionMatch = ['s', 'sticker'].includes(caption.toLowerCase())

        if (hasMediaQuoted || captionMatch) {
          await createStickerFromMessage(sock, msg)
        } else {
          await sock.sendMessage(sender, {
            text: 'Kirim gambar/video lalu reply dengan "s", atau kirim gambar/video langsung dengan caption "s" atau "sticker"',
          }, { quoted: msg })
        }
      } catch (err) {
        console.error('❌ Gagal buat stiker:', err)
        await sock.sendMessage(sender, { text: 'Ups! Gagal bikin stiker 😖 Coba lagi ya~' }, { quoted: msg })
      }
      return
    }

    if (command === 'stickertext' || command === 'st') {
      if (!args[0]) return sock.sendMessage(sender, { text: 'Ketik: stikertext Halo dunia!' }, { quoted: msg })
      const text = args.join(' ')
      const stickerBuffer = await createStickerFromText(text)
      await sock.sendMessage(sender, { sticker: stickerBuffer }, { quoted: msg })
    }
  return false
}

module.exports = {
  handleStaticCommand
}
