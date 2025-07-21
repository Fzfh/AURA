const fs = require('fs');
const path = require('path');
const settingPath = path.join(__dirname, '../setting/setting.js');

function getSetting() {
  delete require.cache[require.resolve(settingPath)];
  return require(settingPath);
}

function saveSetting(newSetting) {
  fs.writeFileSync(settingPath, 'module.exports = ' + JSON.stringify(newSetting, null, 2));
}

module.exports = async function adminBotHandler(sock, msg, command, args) {
  const setting = getSetting();
  const sender = msg.key.participant || msg.key.remoteJid;
  const isGroup = msg.key.remoteJid.endsWith('@g.us');

  const senderNumber = sender.split('@')[0];
  const ownerNumber = sock.user.id.split(':')[0]; // Nomor utama bot
  const adminList = setting.adminList || [];

  const isOwner = senderNumber === ownerNumber;

  // Cek kalau yang manggil bukan owner
  if (!isOwner) {
    await sock.sendMessage(sender, { text: '❌ Hanya owner bot yang bisa mengatur admin bot.' });
    return;
  }

  if (command === 'adminlist') {
    if (adminList.length === 0) {
      await sock.sendMessage(sender, { text: '📭 Daftar admin masih kosong.' });
    } else {
      const listText = adminList.map((num, i) => `*${i + 1}.* wa.me/${num}`).join('\n');
      await sock.sendMessage(sender, { text: `📋 Daftar Admin Bot:\n${listText}` });
    }
    return;
  }

  if (args.length < 2) {
    await sock.sendMessage(sender, { text: '📌 Format:\n.adminbot add 628xxxx\n.adminbot del 628xxxx' });
    return;
  }

  const action = args[0];
  const targetNumber = args[1].replace(/[^0-9]/g, ''); // Bersihin karakter aneh

  if (!targetNumber) {
    await sock.sendMessage(sender, { text: '❌ Nomor tidak valid!' });
    return;
  }

  if (action === 'adminbot') {
    if (adminList.includes(targetNumber)) {
      await sock.sendMessage(sender, { text: '⚠️ Nomor ini sudah ada di admin list.' });
    } else {
      adminList.push(targetNumber);
      setting.adminList = adminList;
      saveSetting(setting);
      await sock.sendMessage(sender, { text: `✅ Nomor ${targetNumber} berhasil ditambahkan ke admin bot.` });
    }
  } else if (action === 'del') {
    if (!adminList.includes(targetNumber)) {
      await sock.sendMessage(sender, { text: '⚠️ Nomor ini tidak ditemukan di admin list.' });
    } else {
      const filtered = adminList.filter(num => num !== targetNumber);
      setting.adminList = filtered;
      saveSetting(setting);
      await sock.sendMessage(sender, { text: `✅ Nomor ${targetNumber} berhasil dihapus dari admin bot.` });
    }
  } else {
    await sock.sendMessage(sender, { text: '📌 Gunakan `add` atau `del` untuk perintah ini.' });
  }
};
