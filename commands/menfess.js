const menfessState = new Map();

const kataTerlarang = [
  "slot", "jp maxwin", "judi", "bo terpercaya", "zeus", "maxwin", "bet",
  "high return", "rtp", "pragmatic", "scatter", "spin", "link", "deposit"
];

module.exports = {
  async handler(sock, msg, { text, sender }) {
    const userId = msg.key.participant || msg.key.remoteJid;
    const from = msg.key.remoteJid;

    if (menfessState.has(userId)) {
      const input = text?.trim() || '';
      const lowerInput = input.toLowerCase();

      if (lowerInput === '/batal' || lowerInput.startsWith('/')) {
        menfessState.delete(userId);
        await sock.sendMessage(from, {
          text: '❌ Menfess dibatalkan.'
        }, { quoted: msg });
        return;
      }

      const lines = input.split(/\r?\n/);
      if (lines.length < 2) {
        await sock.sendMessage(from, {
          text: '⚠ Format salah.\nKirim seperti ini:\n628xxxxxxx\nIsi pesan menfess...'
        }, { quoted: msg });
        return;
      }

      const nomorTujuan = lines[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      const isiPesan = lines.slice(1).join('\n').trim();

      if (!isiPesan) {
        await sock.sendMessage(from, {
          text: '⚠ Isi pesan tidak boleh kosong!'
        }, { quoted: msg });
        return;
      }

      const terlarang = kataTerlarang.some(kata => isiPesan.toLowerCase().includes(kata));
      if (terlarang) {
        await sock.sendMessage(from, {
          text: '🚫 Pesan menfess gagal dikirim karena mengandung kata terlarang.'
        }, { quoted: msg });
        menfessState.delete(userId);
        return;
      }

      await sock.sendMessage(nomorTujuan, {
        text: `📩 *Pesan Menfess Masuk!*\n\n💬 *Isi:* ${isiPesan}\n🔒 *Pengirim dirahasiakan oleh sistem.*`
      });

      await sock.sendMessage(from, {
        text: '✅ Menfess berhasil dikirim secara RAHASIA~ 💌'
      }, { quoted: msg });

      menfessState.delete(userId);
      return;
    }

    if (typeof text === 'string' && text.toLowerCase() === '/menfess') {
      menfessState.set(userId, true);
      await sock.sendMessage(from, {
        text: '💌 Silakan kirim nomor dan isi pesan seperti ini:\n628xxxxxxx\nIsi pesan kamu...\n\nKetik */batal* untuk membatalkan.'
      }, { quoted: msg });
      return;
    }
  }
};
