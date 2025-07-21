const fs = require('fs');
const path = require('path');
const settingPath = path.join(__dirname, '../setting/setting.js');
const setting = require('../setting/setting');

function normalizeNumber(input) {
  let cleaned = input.replace(/[-\s+]/g, '');

  if (cleaned.startsWith('08')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }

  return cleaned + '@s.whatsapp.net';
}

function saveSettingFile(newAdminList) {
  const updated = {
    ...setting,
    adminList: newAdminList
  };

  const fileContent = `module.exports = ${JSON.stringify(updated, null, 2)}\n`;
  fs.writeFileSync(settingPath, fileContent);
}

module.exports = async function adminManagerHandler(sock, msg, text) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const body = text.trim().toLowerCase();
  const [command, ...args] = body.split(/\s+/);
  const fullArgs = args.join(' ').trim();

  // Batasi akses hanya untuk admin bot
  if (!setting.adminList.includes(sender)) {
    return sock.sendMessage(from, {
      text: '🚫 Kamu tidak memiliki izin untuk menggunakan perintah ini!',
    }, { quoted: msg });
  }

  // Lihat daftar admin
  if (command === 'adminlist') {
    const listText = setting.adminList.map((a, i) => `*${i + 1}.* wa.me/${a.replace('@s.whatsapp.net', '')}`).join('\n') || 'Belum ada admin bot';
    return await sock.sendMessage(from, {
      text: `👑 *Daftar Admin Bot:*\n${listText}`
    }, { quoted: msg });
  }

  // Tambah admin bot
  if (command === 'adminbot') {
    if (!fullArgs) {
      return await sock.sendMessage(from, { text: '⚠️ Format: *adminbot <nomor>*' }, { quoted: msg });
    }

    const jid = normalizeNumber(fullArgs);
    if (setting.adminList.includes(jid)) {
      return await sock.sendMessage(from, { text: '⚠️ Nomor sudah terdaftar sebagai admin bot!' }, { quoted: msg });
    }

    setting.adminList.push(jid);
    saveSettingFile(setting.adminList);
    return await sock.sendMessage(from, {
      text: `✅ Admin bot ditambahkan:\nwa.me/${jid.replace('@s.whatsapp.net', '')}`
    }, { quoted: msg });
  }

  // Hapus admin bot
  if (command === 'delbot') {
    if (!fullArgs) {
      return await sock.sendMessage(from, { text: '⚠️ Format: *delbot <nomor>*' }, { quoted: msg });
    }

    const jid = normalizeNumber(fullArgs);
    if (!setting.adminList.includes(jid)) {
      return await sock.sendMessage(from, { text: '❌ Nomor tidak ditemukan di daftar admin bot.' }, { quoted: msg });
    }

    const newList = setting.adminList.filter(x => x !== jid);
    saveSettingFile(newList);
    return await sock.sendMessage(from, {
      text: `🗑️ Admin bot dihapus:\nwa.me/${jid.replace('@s.whatsapp.net', '')}`
    }, { quoted: msg });
  }
};
