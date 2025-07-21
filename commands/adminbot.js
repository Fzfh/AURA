const fs = require('fs');
const path = require('path');

// Path ke file .env
const envPath = path.join(__dirname, '../setting/.env');

// Load dan parsing isi .env
function loadEnv() {
  const envRaw = fs.readFileSync(envPath, 'utf-8');
  const lines = envRaw.split('\n');
  const env = {};
  for (const line of lines) {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
  }
  return env;
}

// Simpan admin list baru ke .env
function updateAdminList(newList) {
  const env = loadEnv();
  env.ADMIN_LIST = newList.join(',');
  const newEnv = Object.entries(env)
    .map(([key, val]) => `${key}=${val}`)
    .join('\n');
  fs.writeFileSync(envPath, newEnv);
}

// Cek adminlist dari .env
function getAdminList() {
  const env = loadEnv();
  return env.ADMIN_LIST ? env.ADMIN_LIST.split(',') : [];
}

function getOwnerNumber() {
  const env = loadEnv();
  return env.OWNER_NUMBER || '';
}

module.exports = async function adminBotHandler(sock, msg, command, args) {
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];
  const adminList = getAdminList();
  const ownerNumber = getOwnerNumber();

  // Perintah: adminlist
  if (command === 'adminlist') {
    if (!adminList.includes(senderNumber)) {
      await sock.sendMessage(sender, { text: '🚫 Kamu bukan admin bot.' });
      return;
    }

    const text = adminList.map((num, i) => `*${i + 1}.* wa.me/${num}`).join('\n') || '📭 Admin bot kosong.';
    await sock.sendMessage(sender, { text: `📋 Daftar Admin Bot:\n${text}` });
    return;
  }

  // Perintah add/del admin
  if (args.length < 2) {
    await sock.sendMessage(sender, {
      text: '📌 Format:\n.adminbot add 628xxxxxx\n.adminbot del 628xxxxxx'
    });
    return;
  }

  const action = args[0];
  const targetNumber = args[1].replace(/[^0-9]/g, '');

  if (senderNumber !== ownerNumber) {
    await sock.sendMessage(sender, { text: '❌ Hanya owner yang bisa ubah admin bot.' });
    return;
  }

  if (action === 'adminbot') {
    if (adminList.includes(targetNumber)) {
      await sock.sendMessage(sender, { text: '⚠️ Nomor sudah terdaftar sebagai admin bot.' });
      return;
    }

    adminList.push(targetNumber);
    updateAdminList(adminList);
    await sock.sendMessage(sender, { text: `✅ ${targetNumber} berhasil jadi admin bot.` });
  } else if (action === 'delbot') {
    if (targetNumber === ownerNumber) {
      await sock.sendMessage(sender, { text: '🚫 Nomor ini adalah OWNER dan tidak bisa dihapus.' });
      return;
    }

    if (!adminList.includes(targetNumber)) {
      await sock.sendMessage(sender, { text: '⚠️ Nomor tidak ditemukan dalam admin list.' });
      return;
    }

    const newList = adminList.filter(num => num !== targetNumber);
    updateAdminList(newList);
    await sock.sendMessage(sender, { text: `✅ ${targetNumber} berhasil dihapus dari admin bot.` });
  } else {
    await sock.sendMessage(sender, { text: '📌 Gunakan perintah `add` atau `del` ya sayang~' });
  }
};
