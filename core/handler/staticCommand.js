const { adminList } = require('../../setting/setting')
async function handleStaticCommand(sock, msg, lowerText, userId, body) {
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
  return false
}

module.exports = {
  handleStaticCommand
}
