const { adminList } = require('../../setting/setting');

// 🛠️ Ambil pengirim asli (resolve long JID → nomor asli)
async function getSenderId(sock, msg) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  let jid =
    msg.key.participant ||
    msg.participant ||
    msg.message?.extendedTextMessage?.contextInfo?.participant ||
    msg.sender ||
    from;

  // ✅ Coba resolve biar nomor panjang jadi +62 asli
  if (jid && !jid.startsWith('62') && !jid.startsWith('1')) {
    try {
      const [result] = await sock.onWhatsApp(jid.split('@')[0]);
      if (result?.jid) jid = result.jid; // contoh: 62895xxxx@s.whatsapp.net
    } catch (err) {
      console.error('❌ Gagal resolve JID:', err);
    }
  }

  return jid;
}

async function handleStaticCommand(sock, msg, lowerText, userId, body) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');
  const actualUserId = await getSenderId(sock, msg);

  // 🧹 Untuk ditampilkan: buang "@s.whatsapp.net"
  const displayNumber = actualUserId.replace('@s.whatsapp.net', '');

  // 🔍 Debug lengkap
  console.log('========================');
  console.log('📩 Pesan baru diterima');
  console.log('📌 isGroup:', isGroup);
  console.log('📌 msg.key.participant:', msg.key?.participant);
  console.log('📌 msg.sender:', msg.sender);
  console.log('📌 userId (fallback):', userId);
  console.log('📌 from:', from);
  console.log('✅ actualUserId:', actualUserId);
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
╰──────────────────────╯
`,
          mentions: [actualUserId], // ✅ mentions tetap JID asli
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
Berikut ini panduan lengkap fitur-fitur utama.

✨ Cobain ya, semoga harimu makin seru!`,
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
✨ Dengan *Artificial Intelligence*  
🧠 Bisa balas otomatis dengan cerdas  

🔹 *Bot Responder (Non-AI)* – Rp65.000  
📋 Hanya respon perintah / menu  
❌ Tanpa AI

🎯 Pilih sesuai kebutuhanmu ya!`,
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
