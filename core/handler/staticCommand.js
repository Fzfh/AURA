const { adminList } = require('../../setting/setting')
async function handleStaticCommand(sock, msg, lowerText, userId, body) {
  const from = msg.key.remoteJid
  const sender = from
  const actualUserId = msg.key.participant || msg.participant || userId;
  const userName = msg.pushName || actualUserId.split('@')[0];
  
  switch (lowerText) {
    case '/menu':
    case 'menu':
    case '.menu':
      await sock.sendMessage(sender, {
       text: `╭━━━〔 ✨ MENU UTAMA AURABOT ✨ 〕━━━╮  
┃ 👋 Hai @${actualUserId.split('@')[0]}, selamat datang!
┃ Berikut daftar fitur yang bisa kamu gunakan:
┃
┃ 🖼 *Sticker dari Gambar/Video*
┃   ➤ Kirim foto/video + caption: \`s\` atau \`sticker\`
┃   ➤ Bot akan otomatis mengubah jadi stiker
┃
┃ ⬆️ *Ambil Sticker Jadi Gambar/Video*
┃   ➤ Reply ke stiker, lalu ketik: \`.sm\`
┃   ➤ Bot akan mengembalikannya jadi media asli
┃
┃ ✍️ *Sticker dari Teks*
┃   ➤ \`.stickertext\` teks kamu
┃   ➤ Contoh: \`.stickertext Halo\`
┃   ➤ Bisa juga singkat: \`.st AuraBot\`
┃
┃ 🎵 *Ekstrak Audio dari Video*
┃   ➤ Kirim video + caption: \`.ets\`
┃   ➤ Atau reply video lalu ketik: \`.ets\`
┃
┃ 💌 *Menfess Anonim*
┃   ➤ Ketik: \`/menfess\` lalu ikuti instruksi
┃
┃ 🗺️ *Cari Lokasi (Google Maps)*
┃   ➤ \`.linkmap\` [nama lokasi]
┃   ➤ Contoh: \`.linkmap Monas Jakarta\`
┃   ➤ Bisa juga reply shareloc lalu ketik \`.linkmap\`
┃
┃ 🗺️🎛️ *Cari Lokasi dan Convert ke QR (MapQR)*
┃   ➤ \`.mapqr\` [nama lokasi]
┃   ➤ Contoh: \`.mapqr Monas Jakarta\`
┃   ➤ Bisa reply shareloc juga
┃
┃ 👰🏻 *Cari Waifu Lucu*
┃   ➤ \`.waifu\` [jenis/nama waifu]
┃   ➤ Contoh: \`.waifu neko\`
┃
┃ ⬇️ *Download TikTok (Video & Foto)*
┃   ➤ \`.d\` [link TikTok]
┃   ➤ Contoh: \`.d https://tiktok.com/xxx\`
┃
┃ ⬇️ *Download Musik TikTok*
┃   ➤ \`.ds\` [link TikTok]
┃   ➤ Contoh: \`.ds https://tiktok.com/xxx\`
┃
┃ ⬇️ *Download Reels Instagram*
┃   ⚠️ *IG butuh waktu ±1 menit, jangan spam ya!*
┃   ➤ \`.dig\` [link Instagram]
┃
┃ 📸 *Ambil Foto Profil*
┃   ➤ \`.pp\` [nomor atau @tag]
┃   ➤ Contoh: \`.pp\` 628xxx atau \`.pp\` @username
┃
┃ 🎛️ *Baca Isi QR Code*
┃   ➤ Reply QR dan ketik: \`.sqr\`
┃   ➤ Bisa juga langsung ketik \`.sqr\`
┃
┃ 🤖 *Beli Bot WA*
┃   ➤ Ketik: \`beli bot\` untuk info harga & fitur
┃
┃ ❓ *Bingung Gunain Bot?*
┃   ➤ Ketik: \`tutorial\` atau \`tutor\`
┃   ➤ Hubungi Owner, Ketik: \`admin\`

╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯  

╭━━━〔 🔒 FITUR ADMIN GRUP 〕━━━╮  
┃ 📸 *Lihat Media Sekali Lihat (1x View)*
┃   ➤ \`.show\` lalu reply ke foto/video 1x lihat
┃
┃ 🔓 *Buka/Tutup Grup Chat*
┃   ➤ \`.open\` = Buka  
┃   ➤ \`.close\` = Tutup
┃
┃ ⤴️ *Promote Member Jadi Admin*
┃   ➤ \`.na\` + reply atau @tag
┃   ➤ Contoh: \`.na\` @aurabot
┃
┃ ⤵️ *Demote Admin ke Member*
┃   ➤ \`.una\` + reply atau @tag
┃   ➤ Contoh: \`.una\` @aurabot
┃
┃ 👥 *Tambah Member ke Grup*
┃   ➤ \`add\` atau \`tambah\` [nomor]
┃   ➤ Contoh: \`tambah 628123456789\`
┃
┃ 🗣️ *Tag Semua Anggota Grup*
┃   ➤ \`.tagall\`  
┃   ➤ Contoh: \`.tagall Halo semua!\`
┃
┃ 🧾 *Buat QR Code dengan Logo*
┃   ➤ \`.cqr\` [teks]
┃   ➤ Contoh: \`.cqr\` halo dunia
┃
┃ 🏗️ *Buat Grup Baru via Bot*
┃   ➤ \`.bg\` [nama grup]
┃   ➤ Contoh: \`.bg Aura Squad\`
┃   ➤ Tambah member langsung:
┃     \`.bg Aura Squad add 62812,62813\`

╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯  

💡 *Tips:*  
➤ Kalau kamu admin, kamu bisa akses semua fitur admin secara otomatis!  
🧠 Ketik sesuai menu ya, dan hindari typo biar AURABOT nggak salah paham 😄  

✨ Selamat mencoba dan semoga membantu aktivitasmu!
`,
       mentions: [actualUserId]
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
        text: `╭━━━〔 PANDUAN PENGGUNAAN 〕━━━╮

Halo  @${actualUserId.split('@')[0]}! 👋  
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
➤ Ketik: \`.cqr\` [teks kamu]  
   Contoh: \`.cqr\` Bayar ke Aura ya!

📌 Penjelasan:  
Bot akan menghasilkan gambar QR dari teks yang kamu tulis. Bisa dipakai untuk membuat QR donasi, pesan rahasia, atau tagihan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎵 *9. Ekstrak MP3 dari Video*
➤ Kirim video dan beri caption: \`.ets\`  
➤ Atau reply ke video lalu ketik: \`.ets\`

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

╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
✨ *Selamat mencoba fitur-fitur AuraBot! Semoga bermanfaat dan bikin harimu lebih seru~* ✨
`,
      mentions: [actualUserId]
      }, { quoted: msg })
      return true

    case 'admin':
      await sock.sendMessage(sender, {
        text: `👩‍💻 *Hubungi Admin AURA BOT*

📞 WhatsApp: [\`Klik untuk chat\`](https://wa.me/62895326679840)  
🕐 Waktu Layanan: 09.00 – 22.00 WIB  
⚡ Status: Fast Respon (selama jam aktif)

🔹 Punya pertanyaan, kendala, atau ingin beli bot?  
Silakan hubungi admin langsung melalui WhatsApp.

💬 Kami siap bantu kamu dengan sepenuh hati!
`
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
