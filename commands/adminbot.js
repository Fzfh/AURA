const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '../../setting/.env');

// Load .env dan parse
function loadEnv() {
  const raw = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  raw.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim();
  });
  return env;
}

// Simpan admin list ke .env
function updateAdminList(newList) {
  const env = loadEnv();
  env.ADMIN_LIST = newList.join(',');
  const newEnv = Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n');
  fs.writeFileSync(envPath, newEnv);
}

// Ambil list admin dan owner
function getAdminList() {
  const env = loadEnv();
  return env.ADMIN_LIST ? env.ADMIN_LIST.split(',') : [];
}
function getOwnerNumber() {
  return loadEnv().OWNER_NUMBER || '';
}

// Normalisasi nomor
function normalizeNumber(input) {
  const clean = input.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) return '62' + clean.slice(1);
  if (clean.startsWith('8')) return '62' + clean;
  if (clean.startsWith('62')) return clean;
  return clean;
}

module.exports = async function adminBotHandler(sock, msg, command, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];
  const adminList = getAdminList();
  const ownerNumber = getOwnerNumber();

  // TAMPILKAN LIST
  if (command === 'adminlist' && args.length === 0) {
    if (!adminList.includes(senderNumber)) {
      await sock.sendMessage(from, { text: '🚫 Kamu bukan admin bot.' });
      return;
    }

    const daftar = adminList.map((n, i) => `*${i + 1}.* wa.me/${n}`).join('\n') || '📭 Admin kosong.';
    await sock.sendMessage(from, { text: `📋 Daftar Admin Bot:\n${daftar}` });
    return;
  }

  // Hanya owner bisa nambah/hapus
  if (senderNumber !== ownerNumber) {
    await sock.sendMessage(from, { text: '❌ Hanya owner bot yang bisa ubah admin.' });
    return;
  }

  const target = normalizeNumber(args[0]);
  if (!target || target.length < 10) {
    await sock.sendMessage(from, { text: '⚠️ Nomor tidak valid.' });
    return;
  }

  if (target === ownerNumber) {
    await sock.sendMessage(from, { text: '👑 Itu nomor owner, tidak bisa dihapus!' });
    return;
  }

  // TAMBAH ADMIN
  if (command === 'adminbot') {
    if (adminList.includes(target)) {
      await sock.sendMessage(from, { text: `⚠️ Nomor ${target} sudah jadi admin.` });
      return;
    }
    adminList.push(target);
    updateAdminList(adminList);
    await sock.sendMessage(from, { text: `✅ ${target} ditambahkan sebagai admin bot.` });
  }

  // HAPUS ADMIN
  if (command === 'delbot') {
    if (!adminList.includes(target)) {
      await sock.sendMessage(from, { text: `❌ Nomor ${target} bukan admin.` });
      return;
    }
    const newList = adminList.filter(n => n !== target);
    updateAdminList(newList);
    await sock.sendMessage(from, { text: `🗑️ ${target} telah dihapus dari admin bot.` });
  }
};
