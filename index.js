require('dotenv').config();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  useSingleFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  usePairingCode,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const express = require('express');
const fs = require('fs');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const chalk = require('chalk');

const tampilkanBanner = require('./core/utils/tampilanbanner');
const { handleResponder, registerGroupUpdateListener } = require('./core/botresponse');

const app = express();
const PORT = 3000;

// --- ARGUMENT PARSING
const args = process.argv.slice(2);
const pairIndex = args.indexOf('--prcode');
const phoneNumber = pairIndex !== -1 ? args[pairIndex + 1] : null;
const usePairing = pairIndex !== -1 && phoneNumber;

function extractMessageContent(msg) {
  const isViewOnce = !!msg.message?.viewOnceMessageV2;
  const realMsg = isViewOnce ? msg.message.viewOnceMessageV2.message : msg.message;
  const text =
    realMsg?.conversation ||
    realMsg?.extendedTextMessage?.text ||
    realMsg?.imageMessage?.caption ||
    realMsg?.videoMessage?.caption ||
    '';
  return { text, realMsg };
}

async function startBot() {
  try {
    const { version } = await fetchLatestBaileysVersion();
    let state, saveCreds;

    if (usePairing) {
      console.log(chalk.cyan(`🔐 Mode pairing aktif dengan nomor: ${phoneNumber}`));
      const pairing = await usePairingCode(phoneNumber, './auth_info');
      state = pairing.state;
      saveCreds = pairing.saveCreds;
    } else {
      const multi = await useMultiFileAuthState('./auth_info');
      state = multi.state;
      saveCreds = multi.saveCreds;
    }

    const sock = makeWASocket({
      logger: P({ level: 'silent' }),
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
      },
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr, pairingCode } = update;

      if (pairingCode && usePairing) {
        console.log(chalk.yellowBright(`\n📲 Pairing Code WA kamu:\n\n${chalk.bold(pairingCode)}\n`));
        console.log(chalk.gray('➡️ Buka WhatsApp, login, lalu masukkan kode ini.'));
      }

      if (qr && !usePairing) {
        console.log(chalk.yellowBright('\n📸 Scan QR berikut untuk login:\n'));
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason === DisconnectReason.loggedOut) {
          fs.rmSync('./auth_info', { recursive: true, force: true });
          console.log(chalk.redBright('\n❌ Logout terdeteksi. Restarting...\n'));
          setTimeout(startBot, 1000);
        } else {
          console.log(chalk.redBright('\n❌ Koneksi terputus. Mencoba ulang...\n'));
          setTimeout(startBot, 3000);
        }
      } else if (connection === 'open') {
        console.log(chalk.greenBright('\n✅ Bot berhasil terhubung ke WhatsApp!'));
        console.log(chalk.cyanBright('AURABOT SUDAH AKTIF! SELAMAT MENIKMATI FITUR KAMI\n'));
        registerGroupUpdateListener(sock);
      }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (!messages || type !== 'notify') return;
      const msg = messages[0];
      if (!msg.message) return;

      const { text, realMsg } = extractMessageContent(msg);
      msg.message = realMsg;

      try {
        await handleResponder(sock, msg);
      } catch (e) {
        console.error(chalk.red('❌ Error di handleResponder:'), e);
      }
    });

  } catch (err) {
    console.error(chalk.bgRed('🔥 Gagal memulai bot:'), err);
  }
}

app.get('/qr', (req, res) => {
  res.send('🛑 Sekarang QR ditampilkan langsung di terminal.');
});

app.listen(PORT, '0.0.0.0', () =>
  console.log(chalk.cyanBright(`🌐 Web server aktif di http://localhost:${PORT} (/qr optional)`))
);

tampilkanBanner();
startBot();
