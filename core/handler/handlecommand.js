const commandMap = new Map([
  ['.waifu', require('../../commands/waifu')],
  ['.waifuhen', require('../../commands/waifuhen')],
  ['.sm', require('../../commands/stickerToMedia')],
  ['.tagall', require('../../commands/tagall')],
  ['.kick', require('../../commands/kick')],
  ['.add', require('../../commands/add')],
  ['.open', require('../../commands/openCloseGroup')],
  ['.close', require('../../commands/openCloseGroup')],
  ['.na', require('../../commands/admin').addAdmin],
  ['.una', require('../../commands/admin').removeAdmin],
  ['.qr', require('../../commands/qris')],
  ['.cqr', require('../../commands/createQr')],
  ['.mapqr', require('../../commands/mapqr')],
  ['.linkmap', require('../../commands/linkmap')],
  ['.sendall', require('../../commands/sendAll')],
  ['.dyts', require('../../commands/youtubeDownloader')],
  ['.d', require('../../commands/tiktokDownloader')],
  ['.ds', require('../../commands/tiktokDownloader')],
  ['.dig', require('../../commands/igDownloader')],
  ['.tl', require('../../commands/translate')],
  ['.st', require('..//stickerHelper')],
  ['stickertext', require('..//stickerHelper')],
  ['.show', require('../../commands/show')],
  ['.reset', require('../../commands/resetMemory')],
  ['s', require('../../commands/stickerReply')],
  ['sticker', require('../../commands/stickerReply')],
]);

async function handleDynamicCommand(sock, msg, text, command, args, from, sender, userId, actualUserId, isGroup) {
  const lowerCommand = command.toLowerCase();

  if (commandMap.has(lowerCommand)) {
    const handler = commandMap.get(lowerCommand);
    if (typeof handler === 'function') {
      return await handler(sock, msg, text, args, from, sender, userId, actualUserId, isGroup);
    }
  }

  return false;
}

module.exports = {
  handleDynamicCommand
};
