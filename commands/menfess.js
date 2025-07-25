const menfessState = new Map()

const kataTerlarang = [
  "slot", "jp maxwin", "judi", "bo terpercaya", "zeus", "maxwin", "bet", "high return", "rtp", "pragmatic", "scatter", "spin", "link", "deposit"
]

module.exports = async function menfess(sock, msg, text) {
  if (typeof text !== 'string') return false

  const sender = msg.key.remoteJid
  const userId = msg.key.participant || sender
  const fromBot = msg.key.fromMe
  const messageId = msg.key.id

  if (menfessState.has(userId)) {
    const input = text.trim()
    const lowerInput = input.toLowerCase()

    if (lowerInput === '/batal' || lowerInput.startsWith('/')) {
      menfessState.delete(userId)
      await sock.sendMessage(sender, {
        text: `❌ *Menfess dibatalkan!*

Pesan rahasia kamu *tidak* dikirim.
Ketik */menfess* untuk memulai lagi.`
      }, { quoted: msg })
      return true
    }

    const lines = input.split(/\r?\n/)

    if (lines.length < 2) {
      await sock.sendMessage(sender, {
        text: `⚠️ *Format salah!*

Kirim dalam format seperti ini:
\`\`\`
628xxxxxxx
Isi pesan menfess kamu...
\`\`\`

Contoh:
\`\`\`
6281234567890
Hai, aku suka kamu sejak lama. Tapi aku malu bilang langsung 🙈
\`\`\`

Ketik */batal* untuk membatalkan.`
      }, { quoted: msg })
      return true
    }

    const nomorTujuan = lines[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    const isiPesan = lines.slice(1).join('\n').trim()

    if (!isiPesan) {
      await sock.sendMessage(sender, {
        text: `⚠️ Oops, pesan kamu kosong.

Kamu cuma kirim nomor tanpa isi pesan ya? Coba kirim ulang dengan format:
\`\`\`
628xxxxxxx
Isi pesan menfess di bawahnya
\`\`\`

Contoh:
\`\`\`
6281234567890
Halo, ini pesan rahasia dari seseorang 👀
\`\`\`

Ketik */batal* untuk membatalkan.` }, { quoted: msg })
      return true
    }

    const terdeteksi = kataTerlarang.some(kata => isiPesan.toLowerCase().includes(kata))
    if (terdeteksi) {
      await sock.sendMessage(sender, {
        text: `🚫 *Menfess Gagal Dikirim!*

Sistem mendeteksi adanya *kata terlarang* dalam isi pesan kamu.

Mohon hindari kata-kata Judol atau porno.
Ketik */menfess* untuk coba lagi.`
      }, { quoted: msg })

      menfessState.delete(userId)
      return true
    }

    await sock.sendMessage(nomorTujuan, {
      text: `┏━━━━━━━━━━━━━━━┓
┃  💌 *MENFESS MASUK*  ┃
┗━━━━━━━━━━━━━━━┛

📝 *Pesan Rahasia:*
${isiPesan}

🔐 *Pengirim dirahasiakan.*
_*Kamu dipilih untuk menerima pesan ini secara pribadi...*_`
    });

    await sock.sendMessage(sender, {
      text: `✅ *Menfess berhasil dikirim!*

📬 Pesanmu telah dikirim secara *RAHASIA* ke nomor tujuan.

_*Tenang, identitasmu dijaga 100% oleh sistem.*_` }, { quoted: msg })

    menfessState.delete(userId)
    return true
  }

  if (typeof text === 'string' && text.toLowerCase() === '/menfess') {
    menfessState.set(userId, true)

    await sock.sendMessage(sender, {
      text: `💌 *Fitur Menfess Aktif!*

Silakan kirim *nomor tujuan dan isi pesan* dengan format seperti ini:
\`\`\`
628xxxxxxxxxx
Isi pesanmu di sini...
\`\`\`

Ketik */batal* kapan saja untuk membatalkan pengiriman.`
    }, { quoted: msg })

    return true
  }

  return false
}
