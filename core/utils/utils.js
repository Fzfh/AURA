const fs = require("fs");
const path = require("path");
const { jidDecode } = require("@whiskeysockets/baileys"); // 🟢 decode bawaan Baileys

function extractText(msg) {
  return (
    msg?.message?.extendedTextMessage?.text ||
    msg?.message?.imageMessage?.caption ||
    msg?.message?.videoMessage?.caption ||
    msg?.message?.conversation ||
    ""
  );
}

function extractContextInfo(msg) {
  return (
    msg?.message?.extendedTextMessage?.contextInfo ||
    msg?.message?.imageMessage?.contextInfo ||
    msg?.message?.videoMessage?.contextInfo ||
    msg?.message?.conversation?.contextInfo
  );
}

function extractQuotedMessage(msg) {
  const ctx = extractContextInfo(msg);
  if (!ctx?.quotedMessage) return "";
  const quoted = ctx.quotedMessage;
  return (
    quoted?.conversation ||
    quoted?.extendedTextMessage?.text ||
    quoted?.imageMessage?.caption ||
    quoted?.videoMessage?.caption ||
    ""
  );
}

// 🔹 Normalize nomor ke format +62xxxx
function normalizeNumber(jid) {
  if (!jid) return '';
  return `+${jid.replace(/@s\.whatsapp\.net$/, '')}`;
}

// 🔹 Normalize JID biar ga jadi @lid lagi
function normalizeJid(jid = "") {
  if (!jid) return "";

  if (jid.endsWith("@g.us")) return jid; // group
  if (jid === "status@broadcast") return jid; // WA status

  if (jid.includes("@s.whatsapp.net")) {
    return jid.split(":")[0] + "@s.whatsapp.net"; // buang suffix aneh
  }

  return jid + "@s.whatsapp.net"; // fallback
}

// 🟢 Resolve JID → nomor asli (decode dulu, kalau gagal pakai sock.onWhatsApp)
async function resolveJid(jid, sock) {
  if (!jid) return "";

  // step 1: kalau group atau broadcast, return aja
  if (jid.endsWith("@g.us") || jid === "status@broadcast") return jid;

  // step 2: decode kalau bisa
  const decoded = jidDecode(jid);
  if (decoded?.user) {
    return decoded.user + "@s.whatsapp.net";
  }

  // step 3: kalau masih LID → cek via onWhatsApp
  try {
    const res = await sock.onWhatsApp(jid);
    if (res?.[0]?.jid) {
      return res[0].jid;
    }
  } catch (e) {
    console.error("resolveJid error:", e.message);
  }

  return jid; // fallback tetap jid awal
}

// 🟢 Ambil nomor display (contoh: 628xxx)
async function getDisplayNumber(jid, sock) {
  const realJid = await resolveJid(jid, sock);
  return realJid.replace(/@s\.whatsapp\.net$/, "");
}

function formatTime() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function botLabel(text) {
  const { botBehavior } = require("../../setting/botconfig");
  return `${botBehavior.botLabel} ${text}`;
}

function loadCommands(...dirs) {
  const commands = {};

  dirs.forEach((dir) => {
    const baseFolder = path.basename(dir);
    const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));

    for (const file of files) {
      const name = path.parse(file).name;
      const key = `${baseFolder}_${name}`;
      const filePath = path.join(dir, file);
      try {
        commands[key] = require(filePath);
      } catch (err) {
        console.error(`❌ Gagal load ${key}:`, err.message);
      }
    }
  });

  return commands;
}

module.exports = {
  extractText,
  extractContextInfo,
  extractQuotedMessage,
  normalizeNumber,
  normalizeJid,
  resolveJid,       // 🟢 export baru
  getDisplayNumber, // 🟢 export baru
  formatTime,
  delay,
  botLabel,
  loadCommands
};
