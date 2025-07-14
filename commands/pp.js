const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = async function pp(sock, msg) {
  const sender = msg.key.remoteJid;
  const body = (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text || ''
  ).toLowerCase().trim();

  if (!['.pp', 'pp'].includes(body)) return false;

  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const target =
    contextInfo?.participant ||
    msg.key.participant ||
    msg.key.remoteJid;

  try {
    const url = await sock.profilePictureUrl(target, 'image');
    if (!url) throw new Error('Ga ada foto profilnya 😢');

    await sock.sendMessage(sender, {
      image: { url },
      caption: `🖼️ Foto profil @${target.split('@')[0]}`,
      mentions: [target],
    }, { quoted: msg });

    return true;
  } catch (e) {
    console.error('[PP ERROR]', e);
    await sock.sendMessage(sender, {
      text: '❌ Gagal ambil foto profil. Mungkin target tidak punya foto profil atau privasinya ketat.',
    }, { quoted: msg });

    return true;
  }
};
