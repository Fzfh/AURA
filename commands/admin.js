const fs = require('fs');
const path = require('path');
const adminFile = path.join(__dirname, '../setting/admin.json');

function getAdminList() {
  if (!fs.existsSync(adminFile)) fs.writeFileSync(adminFile, JSON.stringify([]));
  return JSON.parse(fs.readFileSync(adminFile));
}

function saveAdminList(list) {
  fs.writeFileSync(adminFile, JSON.stringify(list, null, 2));
}

function extractTargetJid(msg, text) {
  const context = msg.message?.extendedTextMessage?.contextInfo || {};
  const mention = context?.mentionedJid?.[0];
  const replyJid = context?.participant;
  const plainNumber = text.split(' ')[1];

  if (mention) return mention;
  if (replyJid) return replyJid;
  if (plainNumber && plainNumber.length >= 9) return plainNumber.replace(/\D/g, '') + '@s.whatsapp.net';
  return null;
}

async function addAdmin(sock, msg, sender, userId, text) {
  const adminList = getAdminList();
  const target = extractTargetJid(msg, text);

  if (!target) {
    return sock.sendMessage(sender, {
      text: '⚠️ Format salah!\n\nContoh:\n.reply lalu .admin\n.admin @628xxx\n.admin 628xxx',
    }, { quoted: msg });
  }

  if (adminList.includes(target)) {
    return sock.sendMessage(sender, {
      text: `ℹ️ User <@${target.split('@')[0]}> sudah jadi admin.`,
      mentions: [target]
    }, { quoted: msg });
  }

  adminList.push(target);
  saveAdminList(adminList);

  await sock.sendMessage(sender, {
    text: `✅ User <@${target.split('@')[0]}> telah dijadikan admin bot!`,
    mentions: [target]
  }, { quoted: msg });
}

async function removeAdmin(sock, msg, sender, userId, text) {
  const adminList = getAdminList();
  const target = extractTargetJid(msg, text);

  if (!target) {
    return sock.sendMessage(sender, {
      text: '⚠️ Format salah!\n\nContoh:\n.reply lalu .unadmin\n.unadmin @628xxx\n.unadmin 628xxx',
    }, { quoted: msg });
  }

  if (!adminList.includes(target)) {
    return sock.sendMessage(sender, {
      text: `❌ User <@${target.split('@')[0]}> bukan admin bot.`,
      mentions: [target]
    }, { quoted: msg });
  }

  const updated = adminList.filter(u => u !== target);
  saveAdminList(updated);

  await sock.sendMessage(sender, {
    text: `✅ User <@${target.split('@')[0]}> telah dihapus dari admin bot!`,
    mentions: [target]
  }, { quoted: msg });
}

module.exports = {
  addAdmin,
  removeAdmin,
  getAdminList
}
