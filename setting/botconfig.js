const { loadCommands } = require('../core/utils/utils');
const path = require('path');

const returnCommand = loadCommands(
  path.join(__dirname, '../commands'),
  path.join(__dirname, '../core')
);
console.log("🔍 Loaded Command Keys:", Object.keys(returnCommand));



const botResponsePatterns = [
  // Commands Umum
  { command: 's', handler: returnCommand["core_stickerHelper"].stickerFromMediaCommand },
  { command: 'st', handler: returnCommand["core_stickerHelper"].stickerTextCommand },
  { command: 'stickertext', handler: returnCommand["core_stickerHelper"].stickerTextCommand },
  { command: 'w', handler: returnCommand["commands_waifu"] },
  { command: 'wh', handler: returnCommand["commands_waifuhen"] },
  { command: 'sqr', handler: returnCommand["commands_qris"] },
  { command: 'cqr', handler: returnCommand["commands_createQr"] },
  { command: 'mapqr', handler: returnCommand["commands_mapqr"] },
  { command: 'linkmap', handler: returnCommand["commands_linkmap"] },
  { command: 'menfess', handler: returnCommand["commands_menfess"] },
  { command: 'sm', handler: returnCommand["commands_stickerToMedia"] },
  { command: 'sa', handler: returnCommand["commands_sendAll"] },
  { command: 'dig', handler: returnCommand["commands_igDownloader"] },
  { command: 'd', handler: returnCommand["commands_tiktokDownloader"] },
  { command: 'ds', handler: returnCommand["commands_tiktokDownloader"] },
  { command: 'ets', handler: returnCommand["commands_ekstrakAudio"] },
  { command: 'pp', handler: returnCommand["commands_pp"] },
  { command: 'admin', handler: returnCommand["commands_admincontact"] },

  // Command Admin Only
  { command: 'kick', handler: returnCommand["commands_kick"], isAdmin: true },
  { command: 'add', handler: returnCommand["commands_add"], isAdmin: true },
  { command: 'admin', handler: returnCommand["commands_admin"], isAdmin: true },
  { command: 'bg', handler: returnCommand["commands_buatGrup"], isAdmin: true },
  { command: 't', handler: returnCommand["commands_tagall"], isAdmin: true },
  { command: 'open', handler: returnCommand["commands_openCloseGroup"], isAdmin: true },
  { command: 'close', handler: returnCommand["commands_openCloseGroup"], isAdmin: true },
  { command: 'na', handler: returnCommand["commands_admin"], isAdmin: true },
  { command: 'una', handler: returnCommand["commands_admin"], isAdmin: true },
  { command: 'del', handler: returnCommand["commands_delete"], isAdmin: true},
  { command: 'show', handler: returnCommand["commands_show"], isAdmin: true },
  { command: 'adminbot', handler: returnCommand["commands_adminbot"] },
  { command: 'delbot', handler: returnCommand["commands_adminbot"] },
  { command: 'adminlist', handler: returnCommand["commands_adminbot"] }

];


module.exports = { botResponsePatterns };
