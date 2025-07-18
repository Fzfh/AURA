module.exports = async (sock, msg) => {
  const vcard = `
    BEGIN:VCARD
    VERSION:3.0
    FN:Aura Developer
    N:Developer;Aura;;;
    TEL;type=CELL;type=VOICE;waid=62895326679840:62895326679840
    END:VCARD`.trim();

  await sock.sendMessage(
    msg.key.remoteJid,
    {
      contacts: {
        displayName: 'Aura Developer',
        contacts: [{ displayName: 'Aura Developer', vcard }]
      }
    },
    { quoted: msg }
  );
};
