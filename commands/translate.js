const translate = require('@vitalets/google-translate-api');

module.exports = async function handleTranslate(sock, msg, text, command, args) {
  const sender = msg.key.remoteJid;
  const isReply = !!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const targetLang = args[0] && args[0].length === 2 ? args[0].toLowerCase() : 'id';
  let originalText = args.join(' ');

  // Kalau reply ke pesan, ambil isinya
  if (isReply && (!originalText || originalText === targetLang)) {
    const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
    if (quoted?.conversation) originalText = quoted.conversation;
    else if (quoted?.extendedTextMessage?.text) originalText = quoted.extendedTextMessage.text;
    else if (quoted?.imageMessage?.caption) originalText = quoted.imageMessage.caption;
    else if (quoted?.videoMessage?.caption) originalText = quoted.videoMessage.caption;
    else originalText = '[Tidak dapat membaca pesan yang di-reply]';
  } else {
    if (args[0] && args[0].length === 2) originalText = args.slice(1).join(' ');
  }

  if (!originalText) {
    return sock.sendMessage(sender, {
      text: '❌ Format salah. Contoh: /tl en Halo dunia\nAtau reply pesan lalu ketik /tl'
    }, { quoted: msg });
  }

  try {
    const res = await translate(originalText, { to: targetLang });
    const result = `🌐 *TRANSLATE RESULT* 🌐\n\n🗣 Asli: ${originalText}\n📍 Dari: ${res.from.language.iso.toUpperCase()}\n📌 Ke: ${targetLang.toUpperCase()}\n\n📄 Hasil:\n${res.text}`;
    await sock.sendMessage(sender, { text: result }, { quoted: msg });
  } catch (e) {
    console.error('❌ Error saat translate:', e);
    await sock.sendMessage(sender, {
      text: '⚠️ Terjadi kesalahan saat menerjemahkan. Coba lagi yaa!'
    }, { quoted: msg });
  }
};
