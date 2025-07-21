const path = require('path');

// Lokasi ke setting.js
const settingPath = path.join(__dirname, '../../setting/setting.js');

// Auto refresh setting dari cache
function refreshSetting() {
  delete require.cache[require.resolve(settingPath)];
  return require(settingPath);
}

// Ambil daftar admin
function getAdminList() {
  return refreshSetting().adminList || [];
}

// Cek apakah user adalah admin
function isAdmin(userId) {
  return getAdminList().includes(userId);
}

// Cek apakah nomor utama (nomor pertama di list)
function isSuperAdmin(userId) {
  const list = getAdminList();
  return list.length > 0 && list[0] === userId;
}

module.exports = {
  getAdminList,
  isAdmin,
  isSuperAdmin
};
