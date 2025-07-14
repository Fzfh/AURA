const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const phoneNumberRegex = /(\+?(\d{8,15}))/;

module.exports = async function pp(sock, msg) {
  const sender = msg.key.remoteJid;
  const body = (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text || ''
  ).trim().toLowerCase();

  if (!body.startsWith('.pp') && !body.startsWith('pp')) return false;

  const args = body.replace(/^(\.pp|pp)/i, '').trim();
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  let target = null;

  if (contextInfo?.mentionedJid?.length) {
    target = contextInfo.mentionedJid[0];

  } else if (args) {
    let num = args.replace(/\D/g, '');

    if (num.startsWith('0')) {
      num = '62' + num.slice(1);
    } else if (num.startsWith('8')) {
      num = '62' + num;
    } else if (num.startsWith('620')) {
      num = '62' + num.slice(3);
    }

    if (num.length >= 10 && num.length <= 15) {
      target = `${num}@s.whatsapp.net`;
    }
  }

  if (!target && contextInfo?.participant) {
    target = contextInfo.participant;
  }

  if (!target && !sender.endsWith('@g.us')) {
    target = sender;
  }

  if (!target) {
    await sock.sendMessage(sender, {
      text: '❌ Format salah. Ketik:\n.pp (tag/reply)\n.pp 628xxxx / 08xxxx / +62 8xxx',
    }, { quoted: msg });
    return true;
  }

  try {
    const url = await sock.profilePictureUrl(target, 'image');
    if (!url) throw new Error('Tidak ada foto profil.');

    await sock.sendMessage(sender, {
      image: { url },
      caption: `📸Berhasil mengambil foto profil @${target.split('@')[0]}`,
      mentions: [target],
    }, { quoted: msg });

    return true;
  } catch (e) {
    console.error('[PP ERROR]', e);
    await sock.sendMessage(sender, {
      text: `❌ Gagal ambil foto profil. Bisa jadi karena:\n• Tidak punya foto profil\n• Privasi dikunci\n• Nomor salah`,
    }, { quoted: msg });

    return true;
  }
};
