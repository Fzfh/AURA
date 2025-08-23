const { adminList } = require('../../setting/setting');

function jidToNumber(jid) {
  if (!jid) return '';
  const num = jid.split('@')[0];
  if (num.startsWith('62')) return `+${num}`;
  if (num.startsWith('8')) return `+62${num}`;
  return `+${num}`;
}

async function handleStaticCommand(sock, msg, lowerText, userId, body) {
  const from = msg.key.remoteJid;
const isGroup = from.endsWith('@g.us');

// 🔍 Debug lengkap
console.log('========================');
console.log('📩 Pesan baru diterima');
console.log('📌 isGroup:', isGroup);
console.log('📌 msg.key.participant:', msg.key?.participant);
console.log('📌 msg.sender:', msg.sender);
console.log('📌 userId (fallback):', userId);
console.log('📌 from:', from);

// 🧩 Hasil final
const actualUserId =
    isGroup ? msg.key.participant
    : msg.key.remoteJid;

console.log('✅ actualUserId:', actualUserId);
console.log('========================');

  const niceNumber = jidToNumber(actualUserId);

  switch (lowerText) {
    case '/menu':
    case 'menu':
    case '.menu':
      await sock.sendMessage(from, {
        text: `╭──〔 ✨ MENU AURABOT ✨ 〕──╮
┃ 👋 Hai @${actualUserId.split('@')[0]}
┃ ( ${niceNumber} )
┃ Yuk cobain fitur-fitur bot ini:
┃
┃ 🎨 *Sticker*
┃  ⤷ Kirim foto/video + caption \`s\`
┃  ⤷ Kasih teks langsung ke foto/video: \`s Halo Banh\`
┃  ⤷ Dari teks ke sticker: \`.stickertext Halo\`
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
┃ 👘 *Waifu Lucu*: \`.w\`
┃
┃ 🤖 *Info Bot*: \`beli bot\` / \`admin\`
┃ ❓ *Bantuan*: \`tutorial\` / \`tutor\`
╰──────────────────────╯
`,
        mentions: [actualUserId]   // ✅ tag nya sesuai userId yang bener
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
      await sock.sendMessage(from, {
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
➤ Kirim foto/video dengan caption: *s*  
➤ Kirim caption dengan teks langsung: *s Aku cantik 😍*  
➤ Atau *balas (reply)* ke media dengan teks *s Halo Dunia*

📌 Penjelasan:  
Bot akan otomatis mengubah media menjadi stiker WhatsApp. Teks akan ditampilkan di bagian bawah stiker dengan \`style\` ala meme! Bisa dari foto *meme*, selfie, bahkan video pendek!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👩‍🎨 *3. Cari Gambar Waifu Anime*
➤ Ketik: *.w*  

📌 Penjelasan:  
Fitur ini menampilkan gambar karakter anime populer secara random.

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

📣 *10. Mention Semua Member*
➤ Ketik: \`t\`

📌 Penjelasan:  
Fitur ini akan men-tag semua member di grup secara otomatis. Hanya bisa digunakan oleh admin.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚪 *11. Keluar dari Sesi Aktif*
➤ Jika kamu sedang dalam mode fitur (seperti menfess), ketik: */batal*

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
      await sock.sendMessage(from, {
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
