module.exports = async (sock, msg) => {
  await sock.sendMessage(
    msg.key.remoteJid,
    {
      contacts: {
        displayName: 'Aura Developer',
        contacts: [
          {
            displayName: 'Aura Developer',
            vcard: `
BEGIN:VCARD
VERSION:3.0
FN:Aura Developer
TEL;type=CELL;type=VOICE;waid=62895326679840:62895326679840
END:VCARD`
          }
        ]
      }
    },
    { quoted: msg }
  );
};
