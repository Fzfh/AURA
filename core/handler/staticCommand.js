const { adminList } = require('../../setting/setting');

async function handleStaticCommand(sock, msg, lowerText, userId, body) {
  const from = msg.key.remoteJid;
  const userId = msg.key.participant || msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  // 🧹 Untuk ditampilkan: buang "@s.whatsapp.net"
  const displayNumber = userId;

  // 🔍 Debug lengkap
  console.log('========================');
  console.log('📩 Pesan baru diterima');
  console.log('📌 isGroup:', isGroup);
  console.log('📌 msg.key.participant:', msg.key?.participant);
  console.log('📌 msg.sender:', msg.sender);
  console.log('📌 userId (fallback):', userId);
  console.log('📌 from:', from);
  console.log('✅ actualUserId:', userId);
  console.log('✅ displayNumber:', displayNumber);
  console.log('========================');

  switch (lowerText) {
    case '/menu':
    case 'menu':
    case '.menu':
      await sock.sendMessage(
        from,
        {
          text: `╭──〔 ✨ MENU AURABOT ✨ 〕──╮
┃ 👋 Hai @${displayNumber}
┃ ( +${displayNumber} )
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
╰──────────────────────╯`,
          mentions: [userId], // ✅ mentions tetap JID asli
        },
        { quoted: msg }
      );
      return true;

    case 'tutorial':
    case 'tutor':
    case 'Tutorial':
    case 'Tutor':
    case 'Tutpr':
    case 'Titor':
    case 'Tytor':
    case 'caranya':
    case 'cara nya':
      await sock.sendMessage(
        from,
        {
          text: `╭━━━〔 PANDUAN PENGGUNAAN 〕━━━╮

Halo  @${displayNumber}! 👋  
Terima kasih telah menggunakan *AuraBot*.  
Berikut ini panduan lengkap dan penjelasan fitur-fitur utama yang bisa kamu gunakan. Yuk kita mulai~

(isi tutor panjang seperti sebelumnya)
`,
          mentions: [userId],
        },
        { quoted: msg }
      );
      return true;

    case 'beli bot':
      await sock.sendMessage(
        from,
        {
          text: `🤖 *Daftar Harga Bot AURA:*

🔹 *Bot Premium (AI)* – Rp100.000  
✨ Dilengkapi dengan *Artificial Intelligence (AI)*  
🧠 Mampu membalas pesan secara otomatis dengan kecerdasan buatan.  
Cocok untuk kamu yang ingin bot aktif layaknya asisten pribadi!

🔹 *Bot Responder (Non-AI)* – Rp65.000  
📋 Bot ini hanya merespons perintah dan menampilkan menu.  
❌ Tidak menggunakan AI  
Cocok untuk kebutuhan bot sederhana dan fungsional.

🎯 Pilih sesuai kebutuhanmu, dan biarkan bot AURA bantu aktivitas digitalmu jadi lebih mudah!`,
        },
        { quoted: msg }
      );
      return true;
  }
  return false;
}

module.exports = {
  handleStaticCommand,
};
