module.exports = {
  name: 'p',
  category: 'group',
  async handler(sock, msg, args) {
    try {
      const { key, message } = msg
      const remoteJid = key.remoteJid
      const contextInfo = message?.extendedTextMessage?.contextInfo

      if (!contextInfo?.stanzaId || !contextInfo?.participant) {
        return sock.sendMessage(remoteJid, {
          text: '❌ Balas pesan yang mau di-pin dulu yaa beb~',
        }, { quoted: msg })
      }

      const quotedKey = {
        remoteJid: key.remoteJid, 
        fromMe: false,
        id: contextInfo.stanzaId,
        participant: contextInfo.participant,
      }

      // Ambil durasi
      const days = parseInt(args[0]) || 1
      if (![1, 7, 30].includes(days)) {
        return sock.sendMessage(remoteJid, {
          text: '❌ Durasi cuma boleh 1, 7, atau 30 hari ya cintaa~ 😘',
        }, { quoted: msg })
      }

      // PIN pesan
      await sock.chatModify({ pin: true }, remoteJid, [{ key: quotedKey }])
      await sock.sendMessage(remoteJid, {
        text: `📌 Pesan berhasil dipin selama ${days} hari!`,
      }, { quoted: msg })

      // Auto unpin setelah waktu habis
      setTimeout(() => {
        sock.chatModify({ pin: false }, remoteJid, [{ key: quotedKey }])
          .then(() => console.log(`📍 Unpinned otomatis setelah ${days} hari`))
          .catch(err => console.error('❌ Gagal unpin:', err))
      }, days * 24 * 60 * 60 * 1000)

    } catch (err) {
      console.error('❌ Error saat handle pin:', err)
      await sock.sendMessage(msg.key.remoteJid, {
        text: `🚨 Error saat mem-pin pesan:\n${err.message}`,
      }, { quoted: msg })
    }
  }
}
