const { adminList } = require('../setting/setting');

module.exports = async function buatGrup(sock, msg, text) {
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderId = sender.includes('@s.whatsapp.net') ? sender : sender.split(':')[0] + '@s.whatsapp.net';

  if (!text.toLowerCase().startsWith('bg ')) return false;

  if (!adminList.includes(senderId)) {
    await sock.sendMessage(sender, {
      text: '🚫 Maaf, hanya admin yang boleh buat grup lewat bot ini.',
    }, { quoted: msg });
    return true;
  }

  const isi = text.slice(3).trim();
  const [beforeAdd, afterAdd] = isi.split(/add/i);
  const namaGrup = beforeAdd.trim();

  if (!namaGrup) {
    await sock.sendMessage(sender, {
      text: '❗ Format salah.\nContoh: `bg NamaGrup` atau `bg NamaGrup add 628xxxx, 628xxxx`',
    }, { quoted: msg });
    return true;
  }

  const participants = [senderId];
  const addedNumbers = [];

  if (afterAdd) {
    const nomorList = afterAdd.split(',').map(n => {
      let num = n.trim().replace(/[^0-9]/g, '');
      if (num.startsWith('0')) num = '62' + num.slice(1);
      return num;
    });

    for (const nomor of nomorList) {
      const jid = `${nomor}@s.whatsapp.net`;
      if (!participants.includes(jid)) {
        participants.push(jid);
        addedNumbers.push(`+${nomor}`);
      }
    }
  }

  try {
    const response = await sock.groupCreate(namaGrup, participants);
    const groupId = response.id;
    const groupCode = await sock.groupInviteCode(groupId);
    const groupLink = `https://chat.whatsapp.com/${groupCode}`;

    const hasilText = `✅ *Grup berhasil dibuat!*\n\n` +
      `📛 *Nama:* ${namaGrup}\n` +
      (addedNumbers.length > 0
        ? `👥 *Berhasil menambahkan:*\n${addedNumbers.join(', ')}\n`
        : '') +
      `🔗 *Link Grup:*\n${groupLink}`;

    await sock.sendMessage(groupId, {
      text: hasilText,
    });

    return true;
  } catch (err) {
    console.error('❌ Gagal buat grup:', err);
    await sock.sendMessage(sender, {
      text: '❌ Gagal membuat grup. Mungkin nomor tidak valid atau bot dibatasi.',
    }, { quoted: msg });
    return true;
  }
};
