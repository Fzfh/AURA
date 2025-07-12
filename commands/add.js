module.exports = async function(sock, msg, nomorList, sender, userId) {
  const groupId = msg.key.remoteJid;
  const metadata = await sock.groupMetadata(groupId);
  const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

  const isGroupAdmin = metadata.participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  );

  if (!isGroupAdmin) {
    await sock.sendMessage(groupId, {
      text: '🚫 Maaf, hanya *admin grup* yang boleh menggunakan perintah ini.',
    }, { quoted: msg });
    return;
  }

  for (let nomor of nomorList) {
    nomor = nomor.replace(/[^0-9]/g, '');
    if (nomor.startsWith('0')) nomor = '62' + nomor.slice(1);

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
        return;
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
          text: `Halo! 🫣\nAku nggak bisa menambahkan kamu langsung ke grup.\nTapi kamu bisa gabung lewat link ini ya:\n\n🌐 https://chat.whatsapp.com/${code}`
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
};
