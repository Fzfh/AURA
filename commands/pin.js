module.exports = {
  name: 'p',
  category: 'group',
  async handler(sock, msg, args) {
    const { remoteJid, key } = msg
    const contextInfo = msg.message?.extendedTextMessage?.contextInfo

    // Cek apakah user reply pesan
    if (!contextInfo?.stanzaId) {
      return sock.sendMessage(remoteJid, {
        text: '❌ Balas pesan yang mau di-pin dulu yaa~',
      }, { quoted: msg })
    }

    const quoted = {
      remoteJid,
      fromMe: false,
      id: contextInfo.stanzaId
    }

    // Tambahkan participant jika ada (biasanya di grup)
    if (contextInfo.participant) {
      quoted.participant = contextInfo.participant
    }

    // Durasi default 1 hari
    let days = parseInt(args[0]) || 1
    if (![1, 7, 30].includes(days)) {
      return sock.sendMessage(remoteJid, {
        text: '❌ Pilih durasi 1, 7, atau 30 hari aja yaa 🥺',
      }, { quoted: msg })
    }

    // Pin pesan
    await sock.chatModify(
      { pin: true },
      remoteJid,
      [quoted]
    )

    await sock.sendMessage(remoteJid, {
      text: `📌 Pesan berhasil dipin selama ${days} hari!`,
    }, { quoted: msg })

    // Timer auto-unpin
    const timeout = days * 24 * 60 * 60 * 1000
    setTimeout(() => {
      sock.chatModify({ pin: false }, remoteJid, [quoted])
        .then(() => console.log(`📍 Unpinned otomatis setelah ${days} hari`))
        .catch(err => console.error('❌ Gagal unpin:', err))
    }, timeout)
  }
}
