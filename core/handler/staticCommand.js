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
┃   ➤ Ketik: \`.stickertext\` teks  
┃   ➤ Contoh: \`.stickertext\` AuraBot  
┃   ➤ Bisa juga: \`.st\` AuraBot
┃  
┃  🎵 Ekstrak Audio dari Video
┃   ➤ Kirim video dengan caption: \`.ets\`
┃   ➤ Atau reply ke video lalu ketik: \`.ets\`
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
┃   ➤ \`.mapqr\` <nama daerah> 
┃   ➤ Contoh: \`.mapqr\` monas Jakarta
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
┃ 📸 Ambil Foto Profile
┃   ➤ \`.pp\` nomor atau tag (@orang)
┃   ➤ Jika chat pribadi bot \`.pp\` nomor
┃   ➤ contoh: \`.pp\` 0898009090
┃   ➤ contoh: \`.pp\` @angga
┃ 
┃ 🎛️ Baca isi Qris
┃   ➤ \`.qr\` 
┃   ➤ Contoh: \`.qr\` reply ke qr code
┃   ➤ bisa juga hanya \`qr\`
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
        text: `╭━━━〔 🧑‍🏫 PANDUAN PENGGUNAAN AURABOT 〕━━━╮

Halo @userid! 👋  
Terima kasih telah menggunakan *AuraBot*.  
Berikut ini panduan lengkap dan penjelasan fitur-fitur utama yang bisa kamu gunakan. Yuk kita mulai~

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 *1. Membuat Stiker dari Teks*
➤ Cukup ketik:
   *stickertext Halo Dunia*  
   atau gunakan versi singkat:
   *st Halo Dunia*

📌 Penjelasan:  
Bot akan membuat stiker berbasis teks dengan gaya unik. Cocok untuk kirim pesan lucu, quotes, atau greeting sticker.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🖼️ *2. Membuat Stiker dari Foto/Video*
➤ Kirim foto/video dengan caption: *s* atau *sticker*  
➤ Atau *balas (reply)* ke media dengan teks *s*

📌 Penjelasan:  
Bot akan otomatis mengubah media menjadi stiker WhatsApp. Bisa digunakan untuk membuat stiker dari selfie, meme, dan video pendek!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👩‍🎨 *3. Cari Gambar Waifu Anime*
➤ Ketik: *.waifu* [nama/kategori]  
   Contoh: *.waifu zero-two*

📌 Penjelasan:  
Fitur ini menampilkan gambar karakter anime populer. Bisa random, atau berdasarkan nama yang kamu ketik.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💌 *4. Menfess Anonim*
➤ Ketik: */menfess*  
Bot akan memandumu mengirim pesan ke seseorang tanpa diketahui identitasmu.  
➤ Untuk membatalkan, ketik: */batal*

📌 Penjelasan:  
Cocok untuk kirim pesan rahasia, menyampaikan unek-unek, atau kirim kode ke seseorang tanpa harus mengungkap identitas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎞️ *5. Download Video & Musik*
➤ *TikTok:*  
   *.d* = otomatis deteksi video dari link  
   *.ds* = hanya ambil musik/audio-nya  
➤ *Instagram:*  
   *.dig* [link]

📌 Penjelasan:  
Bot akan mendownload video/musik dari TikTok dan Instagram berdasarkan link yang kamu kirim. Cepat, praktis, dan tanpa watermark!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🗺️ *6. Lokasi & Link Maps*
➤ Ketik: *.linkmap [nama lokasi]*  
   Contoh: .linkmap Monas Jakarta  
➤ Bisa juga reply ke *share location* lalu ketik: *.linkmap*

📌 Penjelasan:  
Bot akan membuat link Google Maps dari lokasi yang kamu kirim atau balas. Cocok untuk share titik kumpul atau lokasi janjian.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⬆️ *7. Ubah Stiker Jadi Gambar Asli*
➤ Reply ke stiker dan ketik: *.sm*

📌 Penjelasan:  
Kalau kamu ingin menyimpan stiker sebagai gambar biasa (jpg/png), fitur ini akan mengembalikannya ke format media asli.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💸 *8. Buat QRIS dari Teks*
➤ Ketik: `.cqr` [teks kamu]  
   Contoh: `.cqr` Bayar ke Aura ya!

📌 Penjelasan:  
Bot akan menghasilkan gambar QR dari teks yang kamu tulis. Bisa dipakai untuk membuat QR donasi, pesan rahasia, atau tagihan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎵 *9. Ekstrak MP3 dari Video*
➤ Kirim video dan beri caption: `ets`  
➤ Atau reply ke video lalu ketik: `ets`

📌 Penjelasan:  
Bot akan mengambil suara dari video dan mengubahnya menjadi file MP3. Cocok buat nyimpan backsound atau cuplikan lagu.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚪 *10. Keluar dari Sesi Aktif*
➤ Jika kamu sedang dalam mode fitur (seperti menfess), ketik: */keluar*

📌 Penjelasan:  
Digunakan untuk membatalkan proses atau keluar dari mode interaktif jika kamu berubah pikiran.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 *Masih bingung?*
Ketik *menu* untuk melihat semua fitur yang tersedia.  
Bot ini terus berkembang, jadi pantau terus update-nya ya!

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
✨ *Selamat mencoba fitur-fitur AuraBot! Semoga bermanfaat dan bikin harimu lebih seru~* ✨
`
      }, { quoted: msg })
      return true

    case 'admin':
      await sock.sendMessage(sender, {
        text: `👩‍💻 *Hubungi Admin AURA BOT:*\n\n📞 wa.me/62895326679840\n🕐 Online: 09.00 - 22.00 WIB\n\nButuh bantuan? hubungi admin aja yaa! Fast Respon! ✨`
      }, { quoted: msg })
      return true

    case 'beli bot':
      await sock.sendMessage(sender, {
        text: `🤖 *Daftar Harga Bot AURA:*

🔹 *Bot Premium (AI)* – Rp100.000  
✨ Dilengkapi dengan *Artificial Intelligence (AI)*  
🧠 Mampu membalas pesan secara otomatis dengan kecerdasan buatan.  
Cocok untuk kamu yang ingin bot aktif layaknya asisten pribadi!

🔹 *Bot Responder (Non-AI)* – Rp65.000  
📋 Bot ini hanya merespons perintah dan menampilkan menu.  
❌ Tidak menggunakan AI  
Cocok untuk kebutuhan bot sederhana dan fungsional.

🎯 Pilih sesuai kebutuhanmu, dan biarkan bot AURA bantu aktivitas digitalmu jadi lebih mudah!
`
      }, { quoted: msg })
      return true
  }
  return false
}

module.exports = {
  handleStaticCommand
}
