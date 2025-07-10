module.exports = async function kick(sock, msg, text, isGroup) {
  const groupId = msg.key.remoteJid
  const userId = msg.key.participant

  if (!isGroup) {
    return sock.sendMessage(groupId, {
      text: '❌ Perintah ini hanya bisa digunakan di grup yaa~'
    }, { quoted: msg })
  }

  try {
    const metadata = await sock.groupMetadata(groupId)

    if (!metadata || !Array.isArray(metadata.participants)) {
      return sock.sendMessage(groupId, {
        text: '❌ Gagal mengambil data grup.'
      }, { quoted: msg })
    }

    const isSenderAdmin = metadata.participants.some(p =>
      p.id === userId && (p.admin === 'admin' || p.admin === 'superadmin')
    )

    if (!isSenderAdmin) {
      return sock.sendMessage(groupId, {
        text: '❌ Hanya admin grup yang boleh mengeluarkan member yaa~'
      }, { quoted: msg })
    }

    const quotedInfo = msg.message?.extendedTextMessage?.contextInfo
    const repliedUser = quotedInfo?.participant

    if (repliedUser) {
      await sock.groupParticipantsUpdate(groupId, [repliedUser], 'remove')
      return sock.sendMessage(groupId, {
        text: `👋 @${repliedUser.split('@')[0]} telah dikeluarkan dari grup!`,
        mentions: [repliedUser]
      }, { quoted: msg })
    }

    const rawInput = text.split(' ').slice(1).join(' ')
    if (!rawInput) {
      return sock.sendMessage(groupId, {
        text: '❗ Gunakan dengan reply pesan *atau* ketik manual: `.kick 628xxxx` atau `.kick 628xxxx, 629xxxx`'
      }, { quoted: msg })
    }

    const targets = rawInput.split(',').map(n => {
      let num = n.trim().replace(/[^0-9]/g, '')
      if (num.startsWith('0')) num = '62' + num.slice(1)
      return num + '@s.whatsapp.net'
    })

    const results = []
    for (const target of targets) {
      try {
        await sock.groupParticipantsUpdate(groupId, [target], 'remove')
        results.push(`✅ @${target.split('@')[0]}`)
      } catch (err) {
        results.push(`❌ Gagal kick @${target.split('@')[0]}`)
      }
    }

    return sock.sendMessage(groupId, {
      text: `Hasil kick:\n\n${results.join('\n')}`,
      mentions: targets,
    }, { quoted: msg })

  } catch (err) {
    console.error('❌ Gagal kick member:', err)
    return sock.sendMessage(groupId, {
      text: '❌ Gagal mengeluarkan anggota. Pastikan bot adalah admin!'
    }, { quoted: msg })
  }
}
