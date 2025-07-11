require('dotenv').config();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const chalk = require('chalk');
const express = require('express');

const tampilkanBanner = require('./core/utils/tampilanbanner');
const { handleResponder, registerGroupUpdateListener } = require('./core/botresponse');

const app = express();
const PORT = 3000;

// === ARGUMENT PARSING ===
const args = process.argv.slice(2);
const prcodeArg = args.find(arg => arg.startsWith('--prcode='));
const phoneNumber = prcodeArg ? prcodeArg.split('=')[1] : null;
const qrMode = args.includes('--qrcode');
let pairingRequested = false;

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
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      logger: P({ level: 'silent' }),
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
      },
      printQRInTerminal: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr && qrMode) {
        console.log(chalk.yellowBright('\n📸 Scan QR berikut ini:\n'));
        qrcode.generate(qr, { small: true });
      }
      if (qr && phoneNumber && !pairingRequested) {
        try {
          pairingRequested = true;
          console.log(chalk.cyan(`🔐 Mode pairing aktif dengan nomor: ${phoneNumber}`));
          const pairingCode = await sock.requestPairingCode(phoneNumber);
          const formattedCode = pairingCode.slice(0, 4) + '-' + pairingCode.slice(4);
          console.log(chalk.yellowBright(`\n🔑 Masukkan kode ini di WhatsApp:\n\n${chalk.bold(formattedCode)}\n`));
        } catch (err) {
          console.error(chalk.redBright('\n❌ Gagal request pairing code:'), err);
          process.exit(1);
        }
      }
      if (connection === 'open') {
        console.log(chalk.greenBright('\n✅ Bot berhasil terhubung ke WhatsApp!'));
        console.log(chalk.cyanBright('AURABOT SUDAH AKTIF! SELAMAT MENIKMATI FITUR KAMI\n'));
        registerGroupUpdateListener(sock);
      }
      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason === DisconnectReason.loggedOut) {
          fs.rmSync('./auth_info', { recursive: true, force: true });
          console.log(chalk.redBright('\n❌ Logout terdeteksi. Restarting...\n'));
          setTimeout(startBot, 2000);
        } else {
          console.log(chalk.redBright('\n🔁 Koneksi terputus. Mencoba ulang...\n'));
          setTimeout(startBot, 3000);
        }
      }
    });

    // === HANDLE MESSAGE MASUK ===
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (!messages || type !== 'notify') return;
      const msg = messages[0];
      if (!msg.message) return;

      const { text, realMsg } = extractMessageContent(msg);
      msg.message = realMsg;

      try {
        await handleResponder(sock, msg);
      } catch (err) {
        console.error(chalk.red('❌ Error di handleResponder:'), err);
      }
    });
  } catch (err) {
    console.error(chalk.bgRed('🔥 Gagal memulai bot:'), err);
  }
}

// === QR VIA WEB ===
app.get('/qr', (req, res) => {
  res.send('🛑 Sekarang QR ditampilkan langsung di terminal.');
});

app.listen(PORT, '0.0.0.0', () =>
  console.log(chalk.cyanBright(`🌐 Web server aktif di http://localhost:${PORT} (/qr optional)`))
);

tampilkanBanner();
startBot();
