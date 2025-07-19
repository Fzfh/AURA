module.exports = {
  name: 'p',
  category: 'group',
  async handler(sock, msg, args) {
    try {
      const { remoteJid } = msg

      // 🔎 Debug message structure
      console.log('📦 Full Message:', JSON.stringify(msg, null, 2))

      const contextInfo = msg.message?.extendedTextMessage?.contextInfo

      if (!contextInfo?.stanzaId || !contextInfo?.participant) {
        await sock.sendMessage(remoteJid, {
          text: '❌ Balas pesan yang mau di-pin dulu yaa~',
        }, { quoted: msg })
        console.log('⛔ contextInfo tidak lengkap:', contextInfo)
        return
      }

      const quotedKey = {
        remoteJid,
        fromMe: false,
        id: contextInfo.stanzaId,
        participant: contextInfo.participant
      }

      // 🔎 Debug key info
      console.log('🔑 QuotedKey:', quotedKey)

      let days = parseInt(args[0]) || 1
      if (![1, 7, 30].includes(days)) {
        await sock.sendMessage(remoteJid, {
          text: '❌ Pilih durasi 1, 7, atau 30 hari aja yaa 🥺',
        }, { quoted: msg })
        return
      }

      // ✅ FIX PENTING: `key:` harus dibungkus sebagai objek array [{ key: ... }]
      await sock.chatModify({ pin: true }, remoteJid, [{ key: quotedKey }])

      await sock.sendMessage(remoteJid, {
        text: `📌 Pesan berhasil dipin selama ${days} hari!`,
      }, { quoted: msg })

      const timeout = days * 24 * 60 * 60 * 1000
      setTimeout(() => {
        sock.chatModify({ pin: false }, remoteJid, [{ key: quotedKey }])
          .then(() => console.log(`📍 Unpin otomatis setelah ${days} hari`))
          .catch(err => console.error('❌ Gagal unpin:', err))
      }, timeout)

    } catch (err) {
      console.error('❌ Error saat handle pin:', err)
      await sock.sendMessage(msg.remoteJid, {
        text: `🚫 Terjadi kesalahan saat mencoba pin:\n\n${err.message || err}`
      }, { quoted: msg })
    }
  }
}
