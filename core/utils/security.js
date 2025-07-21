const path = require('path');
const settingPath = path.join(__dirname, '../../setting/setting.js');

// Pemilik utama bot (hardcoded)
const OWNER_JID = '62895326679840@s.whatsapp.net';

function refreshSetting() {
  delete require.cache[require.resolve(settingPath)];
  return require(settingPath);
}

function isAdmin(userId) {
  const setting = refreshSetting();
  return userId === OWNER_JID || setting.adminList.includes(userId);
}

function isSuperAdmin(userId) {
  const setting = refreshSetting();
  return userId === OWNER_JID || setting.superAdminList?.includes(userId);
}

module.exports = {
  isAdmin,
  isSuperAdmin,
  OWNER_JID
};
