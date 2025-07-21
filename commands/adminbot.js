const fs = require('fs');
const path = require('path');
const settingPath = path.join(__dirname, '../setting/setting.js');

// Reload setting.js setiap dipanggil
function loadSetting() {
  delete require.cache[require.resolve(settingPath)];
  return require(settingPath);
}

const OWNER_JID = '62895326679840@s.whatsapp.net'; // 👑 Nomor Aura

function normalizeNumber(input) {
  let cleaned = input.replace(/[-\s+]/g, '');
  if (cleaned.startsWith('08') || cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned + '@s.whatsapp.net';
}

function saveSettingFile(newAdminList) {
  const setting = loadSetting();
  const updated = {
    ...setting,
    adminList: newAdminList
  };
  const fileContent = `module.exports = ${JSON.stringify(updated, null, 2)}\n`;
  fs.writeFileSync(settingPath, fileContent);
}

module.exports = async function adminManagerHandler(sock, msg, text) {
  const setting = loadSetting(); // 🔁 load fresh
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const body = text.trim();
  const [command, ...args] = body.split(/\s+/);
  const fullArgs = args.join(' ').trim();

  if (!setting.adminList.includes(sender)) {
    return sock.sendMessage(from, {
      text: '🚫 Kamu tidak memiliki izin untuk menggunakan perintah ini!',
    }, { quoted: msg });
  }

  if (command.toLowerCase() === 'adminlist') {
    const sortedList = [
      OWNER_JID,
      ...setting.adminList.filter(a => a !== OWNER_JID)
    ];

    const listText = sortedList.map((a, i) => {
      const num = a.replace('@s.whatsapp.net', '');
      if (a === OWNER_JID) return `*Pemilik Utama:* wa.me/${num}`;
      return `*${i}.* wa.me/${num}`;
    }).join('\n') || 'Belum ada admin bot';

    return await sock.sendMessage(from, {
      text: `*Daftar Admin Bot:*\n${listText}`
    }, { quoted: msg });
  }

  if (command.toLowerCase() === 'adminbot') {
    if (!fullArgs) {
      return await sock.sendMessage(from, { text: '⚠️ Format: *adminbot <nomor>*' }, { quoted: msg });
    }

    const jid = normalizeNumber(fullArgs);
    if (jid === OWNER_JID) {
      return await sock.sendMessage(from, { text: '👑 Pemilik Utama tidak perlu ditambahkan~' }, { quoted: msg });
    }

    if (setting.adminList.includes(jid)) {
      return await sock.sendMessage(from, { text: '⚠️ Nomor sudah terdaftar sebagai admin bot!' }, { quoted: msg });
    }

    const newList = [...setting.adminList, jid];
    saveSettingFile(newList);
    return await sock.sendMessage(from, {
      text: `✅ Admin bot ditambahkan:\nwa.me/${jid.replace('@s.whatsapp.net', '')}`
    }, { quoted: msg });
  }

  if (command.toLowerCase() === 'delbot') {
    if (!fullArgs) {
      return await sock.sendMessage(from, { text: '⚠️ Format: *delbot <nomor>*' }, { quoted: msg });
    }

    const jid = normalizeNumber(fullArgs);
    if (jid === OWNER_JID) {
      return await sock.sendMessage(from, {
        text: '⛔ Tidak bisa menghapus Pemilik Utama. Dia kekal dan abadi~ 💫'
      }, { quoted: msg });
    }

    if (!setting.adminList.includes(jid)) {
      return await sock.sendMessage(from, {
        text: '❌ Nomor tidak ditemukan di daftar admin bot.'
      }, { quoted: msg });
    }

    const newList = setting.adminList.filter(x => x !== jid);
    saveSettingFile(newList);
    return await sock.sendMessage(from, {
      text: `🗑️ Admin bot dihapus:\nwa.me/${jid.replace('@s.whatsapp.net', '')}`
    }, { quoted: msg });
  }
};
