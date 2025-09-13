const { adminList } = require('../../setting/setting');

// 🧠 Fungsi normalisasi nomor
function getDisplayNumber(jid = '') {
  if (!jid) return 'unknown';
  let num = jid.split('@')[0];
  if (num.startsWith('62')) return num;
  if (num.startsWith('8')) return '62' + num;
  return num;
}

async function handleStaticCommand(sock, msg, lowerText, body, ctx = {}) {
  const { actualUserId } = ctx;
  const from = msg.key.remoteJid;

  // 💡 Normalisasi nomor untuk tampilan
  const displayNumber = getDisplayNumber(actualUserId);

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
          mentions: [actualUserId],
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
Berikut ini panduan lengkap dan penjelasan fitur-fitur utama yang bisa kamu gunakan. Yuk kita mulai~`,
          mentions: [actualUserId],
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
