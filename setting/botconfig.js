const { loadCommands } = require('../core/utils/utils');
const path = require('path');


const botBehavior = {
  botName: 'AuraBot',
  botLabel: '[AuraBot]',
  botMenu: '/menu',
  replyMyMessage: true,
  readMessage: true,
  isTyping: true,
  typingDelay: 1500
};

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
  { command: 'waifu', handler: returnCommand["commands_waifu_waifu"] },
  { command: 'waifuhen', handler: returnCommand["commands_waifu_waifuhen"] },
  { command: 'sqr', handler: returnCommand["commands_qris"] },
  { command: 'cqr', handler: returnCommand["commands_create_createQr"] },
  { command: 'mapqr', handler: returnCommand["commands_create_mapqr"] },
  { command: 'linkmap', handler: returnCommand["commands_create_linkmap"] },
  { command: 'menfess', handler: returnCommand["commands_menfess"] },
  { command: 'sm', handler: returnCommand["commands_sticker_stickerToMedia"] },
  { command: 'sendall', handler: returnCommand["commands_sendAll"] },
  { command: 'dig', handler: returnCommand["commands_download_igDownloader"] },
  { command: 'd', handler: returnCommand["commands_download_tiktokDownloader"] },
  { command: 'ds', handler: returnCommand["commands_download_tiktokDownloader"] },
  { command: 'ets', handler: returnCommand["commands_audio_ekstrakAudio"] },
  { command: 'pp', handler: returnCommand["commands_picture_pp"] },


  // Bahasa dan Bantuan
  { command: 'listbahasa', handler: returnCommand["commands_translate"] },

  // Command Admin Only
  { command: 'kick', handler: returnCommand["commands_grup_kick"], isAdmin: true },
  { command: 'add', handler: returnCommand["commands_grup_add"], isAdmin: true },
  { command: 'admin', handler: returnCommand["commands_grup_admin"], isAdmin: true },
  { command: 'bg', handler: returnCommand["commands_create_buatGrup"], isAdmin: true },
  { command: 'tag', handler: returnCommand["commands_grup_tagall"], isAdmin: true },
  { command: 'open', handler: returnCommand["commands_grup_openCloseGroup"], isAdmin: true },
  { command: 'close', handler: returnCommand["commands_grup_openCloseGroup"], isAdmin: true },
  { command: 'na', handler: returnCommand["commands_grup_admin"], isAdmin: true },
  { command: 'una', handler: returnCommand["commands_grup_admin"], isAdmin: true },
  { command: 'del', handler: returnCommand["commands_grup_delete"], isAdmin: true},
  { command: 'show', handler: returnCommand["commands_picture_show"], isAdmin: true }

];

module.exports = { botBehavior, botResponsePatterns };
