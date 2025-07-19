const { adminList } = require('../setting/setting');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function toJidString(jidObjOrStr) {
  if (typeof jidObjOrStr === 'string') return jidObjOrStr;
  if (typeof jidObjOrStr === 'object' && jidObjOrStr.user && jidObjOrStr.server)
    return `${jidObjOrStr.user}@${jidObjOrStr.server}`;
  return ''; // fallback
}

async function sendAll(sock, senderJid, text) {
  if (!adminList.includes(senderJid)) {
    await sock.sendMessage(senderJid, {
      text: '❌ Kamu tidak punya izin untuk menjalankan perintah ini.'
    });
    return;
  }

  const botNumber = toJidString(sock.user.id);
  const groups = await sock.groupFetchAllParticipating();
  const groupIds = Object.keys(groups);
  const uniqueContacts = new Set();

  for (const gid of groupIds) {
    const group = groups[gid];
    const isSenderInGroup = group.participants.some(p => toJidString(p.id) === senderJid);
    if (!isSenderInGroup) continue;

    for (const participant of group.participants) {
      const jid = toJidString(participant.id);
      if (jid && jid !== senderJid && jid !== botNumber) {
        uniqueContacts.add(jid);
      }
    }
  }

  for (const jid of uniqueContacts) {
    try {
      await sock.sendMessage(jid, {
        text: text,
        contextInfo: {
          messageStubType: 20,
          quotedMessage: { messageContextInfo: {} },
          externalAdReply: {
            title: 'Aura Bot 💫',
            body: 'Status',
            mediaType: 1,
            showAdAttribution: true,
            thumbnail: null
          }
        }
      });

      await delay(1200); // biar aman dikit
    } catch (err) {
      console.error(`❌ Gagal kirim ke ${jid}:`, err.message);
    }
  }
}

module.exports = sendAll;
