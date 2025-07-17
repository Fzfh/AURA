module.exports = async function(sock, msg, text, sender, userId) {
  const groupId = msg.key.remoteJid;

  if (!groupId.endsWith('@g.us')) {
    await sock.sendMessage(groupId, {
      text: '❌ Perintah ini hanya bisa digunakan di *grup* yaa~',
    }, { quoted: msg });
    return true;
  }

  const realSender = msg.key.participant || msg.key.remoteJid; 
  const metadata = await sock.groupMetadata(groupId);
  const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

  const isGroupAdmin = metadata.participants.some(
    p => p.id === realSender && (p.admin === 'admin' || p.admin === 'superadmin')
  );

  if (!isGroupAdmin) {
    await sock.sendMessage(groupId, {
      text: '🚫 Maaf, hanya *admin grup* yang boleh menggunakan perintah ini.',
    }, { quoted: msg });
    return true;
  }

  const rawNomorList = text.split(' ').slice(1).join(' ');
  if (!rawNomorList) {
    await sock.sendMessage(groupId, {
      text: '❗ Kirim seperti ini: `.add 628xxxxx, 089xxxx, +62 8xxx` untuk menambahkan member',
    }, { quoted: msg });
    return true;
  }

  const nomorList = rawNomorList.split(',').map(n => {
    let nomor = n.replace(/[^\d+]/g, ''); // hanya angka dan +
    if (nomor.startsWith('+')) nomor = nomor.slice(1);
    if (nomor.startsWith('0')) nomor = '62' + nomor.slice(1);
    if (!nomor.startsWith('62')) nomor = '62' + nomor;
    return nomor;
  });

  for (let nomor of nomorList) {
    const jid = `${nomor}@s.whatsapp.net`;

    try {
      const [check] = await sock.onWhatsApp(jid);
      if (!check?.exists) {
        await sock.sendMessage(groupId, {
          text: `❌ Nomor ${nomor} tidak terdaftar di WhatsApp.`,
        }, { quoted: msg });
        continue;
      }

      const alreadyInGroup = metadata.participants.some(p => p.id === jid);
      if (alreadyInGroup) {
        await sock.sendMessage(groupId, {
          text: `ℹ️ @${nomor} sudah ada di grup kok~`,
          mentions: [jid]
        }, { quoted: msg });
        continue;
      }

      const isBotAdmin = metadata.participants.some(p => p.id === botNumber && p.admin);
      if (!isBotAdmin) {
        await sock.sendMessage(groupId, {
          text: '❌ Bot bukan admin grup, jadi gak bisa nambahin member.',
        }, { quoted: msg });
        return true;
      }

      await sock.groupParticipantsUpdate(groupId, [jid], 'add');
      await sock.sendMessage(groupId, {
        text: `✅ @${nomor} berhasil ditambahkan ke grup!`,
        mentions: [jid]
      }, { quoted: msg });

    } catch (err) {
      console.error(`❌ Gagal menambahkan ${nomor}:`, err);
      try {
        const code = await sock.groupInviteCode(groupId);
        await sock.sendMessage(jid, {
          text: `Halo! 👋\nAku nggak bisa menambahkan kamu langsung ke grup.\nTapi kamu bisa gabung lewat link ini ya:\n🌐 https://chat.whatsapp.com/${code}`
        });

        await sock.sendMessage(groupId, {
          text: `⚠️ Gagal menambahkan @${nomor}, tapi link undangan sudah dikirim ke dia ✉️`,
          mentions: [jid]
        }, { quoted: msg });
      } catch (inviteErr) {
        console.error('❌ Gagal kirim link undangan:', inviteErr);
        await sock.sendMessage(groupId, {
          text: `⚠️ Gagal menambahkan @${nomor} dan kirim link.`,
          mentions: [jid]
        }, { quoted: msg });
      }
    }
  }

  return true;
};
