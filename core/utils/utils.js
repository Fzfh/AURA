const fs = require("fs");
const path = require("path");

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

  // Group JID biarin apa adanya
  if (jid.endsWith("@g.us")) return jid;

  // Kalau broadcast biarin aja (buat status WA)
  if (jid === "status@broadcast") return jid;

  // Kalau private user JID (biasanya xxx@s.whatsapp.net atau xxx:1@s.whatsapp.net)
  if (jid.includes("@s.whatsapp.net")) {
    // buang tambahan setelah ":"
    return jid.split(":")[0] + "@s.whatsapp.net";
  }

  // fallback: kasih suffix s.whatsapp.net
  return jid + "@s.whatsapp.net";
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
    const baseFolder = path.basename(dir); // ambil nama foldernya langsung
    const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));

    for (const file of files) {
      const name = path.parse(file).name;
      const key = `${baseFolder}_${name}`; // contoh: core_stickerHelper
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
  normalizeJid, // 🟢 export fungsi baru
  formatTime,
  delay,
  botLabel,
  loadCommands
};
