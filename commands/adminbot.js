const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '../../setting/.env');

// Load .env
function loadEnv() {
  const raw = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  raw.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val !== undefined) env[key.trim()] = val.trim();
  });
  return env;
}

// Simpan ke .env
function updateAdminList(newList) {
  const env = loadEnv();
  env.ADMIN_LIST = newList.join(',');
  const updated = Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n');
  fs.writeFileSync(envPath, updated);
}

function getAdminList() {
  return loadEnv().ADMIN_LIST?.split(',') || [];
}
function getOwnerNumber() {
  return loadEnv().OWNER_NUMBER || '';
}

function normalizeNumber(input) {
  if (!input) return '';
  let numbers = input.replace(/\D/g, ''); // Hanya ambil digit angka

  if (numbers.startsWith('0')) return '62' + numbers.slice(1);
  if (numbers.startsWith('8')) return '62' + numbers;
  if (numbers.startsWith('62')) return numbers;
  return numbers;
}

module.exports = async function adminBotHandler(sock, msg, command, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];
  const adminList = getAdminList();
  const ownerNumber = getOwnerNumber();

  // ❗ Cek jika bukan owner, langsung tolak
  if (!adminList.includes(senderNumber) && command !== 'adminlist') {
    if (senderNumber !== ownerNumber) {
      await sock.sendMessage(from, { text: '❌ Hanya owner bot yang bisa ubah admin.' });
      return;
    }
  }

  // ✅ TAMPILKAN LIST ADMIN
  if (command === 'adminlist') {
    const daftar = adminList.map((n, i) => `*${i + 1}.* wa.me/${n}`).join('\n') || '📭 Admin kosong.';
    await sock.sendMessage(from, { text: `📋 Daftar Admin Bot:\n${daftar}` });
    return;
  }

  // ✅ TAMBAH ADMIN
  if (command === 'adminbot' && args[0]?.toLowerCase() === 'add') {
    const rawNumber = args.slice(1).join(' ');
    const target = normalizeNumber(rawNumber);

    if (!target || target.length < 10) {
      await sock.sendMessage(from, { text: '⚠️ Nomor tidak valid.' });
      return;
    }

    if (target === ownerNumber) {
      await sock.sendMessage(from, { text: '👑 Itu nomor owner, tidak bisa diubah!' });
      return;
    }

    if (adminList.includes(target)) {
      await sock.sendMessage(from, { text: `⚠️ Nomor *${target}* sudah jadi admin.` });
      return;
    }

    adminList.push(target);
    updateAdminList(adminList);
    await sock.sendMessage(from, { text: `✅ *${target}* berhasil ditambahkan sebagai admin bot.` });
    return;
  }

  // ✅ HAPUS ADMIN
  if (command === 'delbot' && args[0]?.toLowerCase() === 'del') {
    const rawNumber = args.slice(1).join(' ');
    const target = normalizeNumber(rawNumber);

    if (!target || target.length < 10) {
      await sock.sendMessage(from, { text: '⚠️ Nomor tidak valid.' });
      return;
    }

    if (!adminList.includes(target)) {
      await sock.sendMessage(from, { text: `❌ Nomor *${target}* bukan admin.` });
      return;
    }

    const newList = adminList.filter(n => n !== target);
    updateAdminList(newList);
    await sock.sendMessage(from, { text: `🗑️ *${target}* telah dihapus dari admin bot.` });
    return;
  }

  // ❓ Kalau command salah
  await sock.sendMessage(from, {
    text: `⚙️ Format salah! Gunakan salah satu dari:\n\n• *adminbot add 628xxx*\n• *delbot del 628xxx*\n• *adminlist*`
  });
};
