const path = require('path');
const settingPath = path.join(__dirname, '../../setting/setting.js');

function refreshSetting() {
  delete require.cache[require.resolve(settingPath)];
  return require(settingPath);
}

function isAdmin(id) {
  const setting = refreshSetting();
  return setting.adminList.includes(id);
}

function isSuperAdmin(userId) {
  const setting = refreshSetting();
  return setting.superAdminList?.includes(userId);
}

module.exports = {
  isAdmin,
  isSuperAdmin,
};
