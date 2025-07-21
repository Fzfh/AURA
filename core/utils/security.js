const path = require('path');
const settingPath = path.join(__dirname, '../../setting/setting.js');

function refreshSetting() {
  delete require.cache[require.resolve(settingPath)];
  return require(settingPath);
}

module.exports = {
  isAdmin(userId) {
    const setting = refreshSetting();
    return setting.adminList.includes(userId);
  },

  isSuperAdmin(userId) {
    const setting = refreshSetting();
    return setting.superAdminList?.includes(userId); 
  }
};
