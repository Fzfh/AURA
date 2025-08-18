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
const { setupAntiDelete } = require("./commands/antidelete");

const app = express();
const PORT = 3000;

const args = process.argv.slice(2);
const prcodeArg = args.find(arg => arg.startsWith('--prcode='));
const phoneNumber = prcodeArg ? prcodeArg.split('=')[1] : null;
const qrMode = args.includes('--qrcode');

let latestQR = null;
let qrRetryInterval = null;
let pairingRetryTimeout = null;
let pairingRequested = false;

// 🔧 Helper normalisasi jid → selalu @s.whatsapp.net
function normalizeJid(jid = '') {
  if (!jid) return jid;
  return jid.replace(/:.*@/g, '@').replace('@lid', '@s.whatsapp.net');
}

function extractMessageContent(msg) {
  let realMsg = msg.message;
  if (!realMsg) return { text: '', realMsg: null };

  if (realMsg?.ephemeralMessage) {
    realMsg = realMsg.ephemeralMessage.message;
  } else if (realMsg?.viewOnceMessageV2) {
    realMsg = realMsg.viewOnceMessageV2.message;
  }

  const text =
    realMsg?.conversation ||
    realMsg?.extendedTextMessage?.text ||
    realMsg?.imageMessage?.caption ||
    realMsg?.videoMessage?.caption ||
    realMsg?.documentMessage?.caption ||
    realMsg?.buttonsResponseMessage?.selectedButtonId ||
    realMsg?.buttonsResponseMessage?.selectedDisplayText ||
    realMsg?.templateButtonReplyMessage?.selectedDisplayText ||
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
      syncFullHistory: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
      },
      printQRInTerminal: false,
    });

    // 🔧 Simpan bot id ter-normalisasi
    global.sock = sock;
    global.BOT_ID = normalizeJid(sock.user.id);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr && qrMode) {
        latestQR = qr;
        console.log(chalk.yellowBright('\n📸 Scan QR berikut ini:\n'));
        qrcode.generate(qr, { small: true });

        if (qrRetryInterval) clearInterval(qrRetryInterval);
        qrRetryInterval = setInterval(() => {
          if (latestQR) {
            console.log(chalk.yellow('\n🔁 QR ulang karena belum discan:\n'));
            qrcode.generate(latestQR, { small: true });
          }
        }, 60_000);
      }

      if (qr && phoneNumber && !pairingRequested) {
        pairingRequested = true;

        const requestPairing = async () => {
          try {
            console.log(chalk.cyan(`🔐 Mode pairing aktif dengan nomor: ${phoneNumber}`));
            const code = await sock.requestPairingCode(phoneNumber);
            const formatted = code.slice(0, 4) + '-' + code.slice(4);
            console.log(chalk.yellowBright(`\n🔑 Masukkan kode ini di WhatsApp:\n\n${chalk.bold(formatted)}\n`));
          } catch (err) {
            console.error(chalk.red('❌ Gagal generate pairing code. Ulang dalam 30 detik...'));
            pairingRetryTimeout = setTimeout(requestPairing, 30_000);
          }
        };

        requestPairing();
      }

      if (connection === 'open') {
        console.log(chalk.greenBright('\n✅ Bot berhasil terhubung ke WhatsApp!'));
        console.log(chalk.cyanBright('✨ AURABOT SIAP MELAYANI TUAN AURAA 😎\n'));
        if (qrRetryInterval) clearInterval(qrRetryInterval);
        if (pairingRetryTimeout) clearTimeout(pairingRetryTimeout);
        registerGroupUpdateListener(sock);
        setupAntiDelete(sock);
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        if (reason === DisconnectReason.loggedOut) {
          fs.rmSync('./auth_info', { recursive: true, force: true });
          console.log(chalk.redBright('\n❌ Logout terdeteksi. Restarting...\n'));
          setTimeout(startBot, 3000);
        } else {
          console.log(chalk.redBright('\n🔁 Koneksi terputus. Mencoba ulang...\n'));
          setTimeout(startBot, 5000);
        }
      }
    });

    // Pesan masuk
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (!messages || type !== 'notify') return;
      const msg = messages[0];
      if (!msg.message) return;

      // 🔧 Normalisasi ID langsung
      msg.key.remoteJid = normalizeJid(msg.key.remoteJid);
      msg.key.participant = normalizeJid(msg.key.participant);
      if (msg.participant) msg.participant = normalizeJid(msg.participant);
      if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
        msg.message.extendedTextMessage.contextInfo.participant =
          normalizeJid(msg.message.extendedTextMessage.contextInfo.participant);
      }
      if (Array.isArray(msg.message?.extendedTextMessage?.contextInfo?.mentionedJid)) {
        msg.message.extendedTextMessage.contextInfo.mentionedJid =
          msg.message.extendedTextMessage.contextInfo.mentionedJid.map(j => normalizeJid(j));
      }

      console.log('🔔 Pesan baru masuk:', {
        type,
        from: msg.key.remoteJid,
        sender: msg.key.participant,
        isGroup: msg.key.remoteJid?.endsWith('@g.us'),
        contentPreview: JSON.stringify(msg.message)?.slice(0, 120)
      });
      console.log('📣 MentionedJid:', msg.message?.extendedTextMessage?.contextInfo?.mentionedJid);

      const { text, realMsg } = extractMessageContent(msg);
      msg._realMessage = realMsg;
      msg._text = text;

      try {
        await handleResponder(sock, msg);
      } catch (err) {
        console.error(chalk.red('❌ Error di handleResponder:'), err);
      }
    });

  } catch (err) {
    console.error(chalk.bgRed('🔥 Gagal memulai bot:'), err);
    setTimeout(startBot, 5000);
  }
}

app.get('/qr', (req, res) => {
  res.send('🛑 QR ditampilkan langsung di terminal.');
});

app.listen(PORT, '0.0.0.0', () =>
  console.log(chalk.cyanBright(`🌐 Web server aktif di http://localhost:${PORT} (/qr optional)`))
);

tampilkanBanner();
startBot();
