const path = require('path');
const settingPath = path.join(__dirname, '../../setting/setting.js');

// Pakai full JID karena adminList kamu full JID
const OWNER_JID = '62895326679840@s.whatsapp.net';

function refreshSetting() {
  delete require.cache[require.resolve(settingPath)];
  return require(settingPath);
}

function normalizeJid(jid) {
  // Pastikan jid selalu pakai @s.whatsapp.net
  return jid.includes('@s.whatsapp.net') ? jid : jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
}

function isAdmin(userId) {
  const setting = refreshSetting();
  const jid = normalizeJid(userId);
  return jid === OWNER_JID || setting.adminList.includes(jid);
}

function isSuperAdmin(userId) {
  const setting = refreshSetting();
  const jid = normalizeJid(userId);
  return jid === OWNER_JID || setting.superAdminList?.includes(jid);
}

module.exports = {
  isAdmin,
  isSuperAdmin,
  OWNER_JID
};
