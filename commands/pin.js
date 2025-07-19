module.exports = {
  name: 'p',
  category: 'group',
  async handler(sock, msg, args) {
    const { remoteJid } = msg
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo

    if (!contextInfo?.stanzaId || !contextInfo?.participant) {
      return sock.sendMessage(remoteJid, {
        text: '❌ Balas pesan yang mau di-pin dulu yaa~',
      }, { quoted: msg })
    }

    const quotedKey = {
      remoteJid,
      fromMe: false,
      id: contextInfo.stanzaId,
      participant: contextInfo.participant
    }

    let days = parseInt(args[0]) || 1
    if (![1, 7, 30].includes(days)) {
      return sock.sendMessage(remoteJid, {
        text: '❌ Pilih durasi 1, 7, atau 30 hari aja yaa 🥺',
      }, { quoted: msg })
    }

    // ✅ FIX: key dibungkus dalam object
    await sock.chatModify({ pin: true }, remoteJid, [{ key: quotedKey }])

    await sock.sendMessage(remoteJid, {
      text: `📌 Pesan berhasil dipin selama ${days} hari!`,
    }, { quoted: msg })

    const timeout = days * 24 * 60 * 60 * 1000
    setTimeout(() => {
      sock.chatModify({ pin: false }, remoteJid, [{ key: quotedKey }])
        .then(() => console.log(`📍 Unpinned otomatis setelah ${days} hari`))
        .catch(err => console.error('❌ Gagal unpin:', err))
    }, timeout)
  }
}
