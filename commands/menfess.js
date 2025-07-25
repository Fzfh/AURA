module.exports = {
  async handler(sock, msg, { text, args, prefix, command, from, sender }) {
    const [target, ...pesan] = args;
    if (!target || !pesan.length) {
      return sock.sendMessage(from, {
        text: `Format salah!\nContoh: ${prefix}menfess 628xxxxx Halo kamu, aku suka sama kamu!`,
      }, { quoted: msg });
    }

    const tujuan = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    const isiPesan = pesan.join(' ');

    try {
      await sock.sendMessage(tujuan, {
        text: `📩 *Menfess Message!*\n\n${isiPesan}\n\n🕊️ Kiriman anonim dari seseorang 😉`,
      });

      await sock.sendMessage(from, {
        text: '✅ Menfess berhasil dikirim!',
      }, { quoted: msg });
    } catch (e) {
      console.error(e);
      sock.sendMessage(from, {
        text: '❌ Gagal mengirim menfess. Cek nomornya ya!',
      }, { quoted: msg });
    }
  }
};
