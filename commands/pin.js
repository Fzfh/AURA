module.exports = {
  name: 'p',
  category: 'group',
  async handler(sock, msg, args) {
    const { remoteJid, key } = msg

    // Cek apakah user reply pesan
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.stanzaId
      ? {
          remoteJid,
          fromMe: false,
          id: msg.message.extendedTextMessage.contextInfo.stanzaId,
          participant: msg.message.extendedTextMessage.contextInfo.participant,
        }
      : key

    if (!quoted?.id) {
      return sock.sendMessage(remoteJid, {
        text: '❌ Balas pesan yang mau di-pin dulu yaa beb~',
      }, { quoted: msg })
    }

    // Durasi default 1 hari
    let days = parseInt(args[0]) || 1
    if (![1, 7, 30].includes(days)) {
      return sock.sendMessage(remoteJid, {
        text: '❌ Pilih durasi 1, 7, atau 30 hari aja ya cintaaa~ 💋',
      }, { quoted: msg })
    }

    // Pin pesannya
    await sock.chatModify(
      { pin: true },
      remoteJid,
      [quoted]
    )

    await sock.sendMessage(remoteJid, {
      text: `📌 Pesan berhasil dipin selama ${days} hari!`,
    }, { quoted: msg })

    // Timer untuk auto unpin
    const timeout = days * 24 * 60 * 60 * 1000 // ms
    setTimeout(() => {
      sock.chatModify({ pin: false }, remoteJid, [quoted])
        .then(() => console.log(`📍 Unpinned pesan otomatis setelah ${days} hari`))
        .catch(err => console.error('❌ Gagal unpin:', err))
    }, timeout)
  }
}
