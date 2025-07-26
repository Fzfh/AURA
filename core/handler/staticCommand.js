const { adminList } = require('../../setting/setting');
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
       text: `╭──〔 ✨ MENU AURABOT ✨ 〕──╮
┃ 👋 Hai @${actualUserId.split('@')[0]}!
┃ Yuk cobain fitur-fitur bot ini:
┃
┃ 🎨 *Sticker*
┃  ⤷ Kirim foto/video + caption \`s\`
┃  ⤷ Dari teks: \`.stickertext Halo\`
┃  ⤷ Balik stiker ke media: \`.sm\`
┃
┃ 🎧 *Audio & Musik*
┃  ⤷ Ekstrak dari video: \`.ets\`
┃  ⤷ Musik TikTok: \`.ds <link>\`
┃
┃ 📥 *Downloader*
┃  ⤷ TikTok: \`.d <link>\`
┃  ⤷ Reels IG: \`.dig <link>\`
┃
┃ 🗺️ *Maps & Lokasi*
┃  ⤷ Cari lokasi: \`.linkmap Monas\`
┃  ⤷ QR lokasi: \`.mapqr Monas\`
┃
┃ 💌 *Menfess Anonim*: \`/menfess\`
┃
┃ 🖼️ *Foto Profil*: \`.pp\` 628xxx / @tag
┃
┃ 🧾 *QR Code*:
┃  ⤷ Baca: reply QR + \`.sqr\`
┃  ⤷ Buat: \`.cqr halo dunia\`
┃
┃ 👘 *Waifu Lucu*: \`.waifu neko\`
┃
┃ 🤖 *Info Bot*: \`beli bot\` / \`admin\`
┃ ❓ *Bantuan*: \`tutorial\` / \`tutor\`
╰──────────────────────╯

╭──〔 🔒 ADMIN GRUP 〕──╮
┃ 👥 *Member & Tag*
┃  ⤷ Promote/Demote: \`.na\` / \`.una\`
┃  ⤷ Tambah member: \`.add 628xxx\`
┃  ⤷ Tag semua: \`.t\`
┃
┃ 🔐 *Kelola Grup*
┃  ⤷ Buka/Tutup: \`.open\` / \`.close\`
┃  ⤷ Hapus pesan: \`.del\`
┃  ⤷ Lihat 1x View: \`.show\`
┃
┃ 🏗️ *Buat Grup*
┃  ⤷ Tanpa member: \`.bg Nama\`
┃  ⤷ Dengan member: \`.bg Nama add 628xx,...\`
╰────────────────────╯

💡 *Tips:* Admin grup langsung bisa akses fitur admin!  
✨ Selamat mencoba Fitur Kami
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
   
➤ *CONTOH:*
➤ .d https://vt.tiktok/linkKamu
➤ .dig https://instagram.com/linkKamu

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
Ketik *admin* untuk menghubungi owner bot.  
Bot ini terus berkembang, jadi pantau terus update-nya ya!

╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯
✨ *Selamat mencoba fitur-fitur AuraBot! Semoga bermanfaat dan bikin harimu lebih seru~* ✨
`,
      mentions: [actualUserId]
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
