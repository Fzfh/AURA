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

function normalizeNumber(jid) {
  if (!jid) return '';
  return `+${jid.replace(/@s\.whatsapp\.net$/, '')}`;
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
  const { botBehavior } = require("../../setting/botConfig");
  return `${botBehavior.botLabel} ${text}`;
}

function loadCommands(baseDir = path.join(__dirname, "../../commands")) {
  const commands = {};

  function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (file.endsWith(".js")) {
        const relative = path.relative(baseDir, fullPath);
        const key = relative.replace(/\\/g, "/").replace(/\.js$/, "").replace(/\//g, "_");
        commands[key] = require(fullPath);
      }
    }
  }

  traverse(baseDir);
  return commands;
}

module.exports = {
  extractText,
  extractContextInfo,
  extractQuotedMessage,
  normalizeNumber,
  formatTime,
  delay,
  botLabel,
  loadCommands,
};
