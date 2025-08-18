// kick.js
const chalk = require("chalk");

// 🔧 Normalizer JID (hapus device tag & ubah @lid -> @s.whatsapp.net)
function normalizeJid(jid) {
  if (!jid) return "";
  return jid
    .replace(/:.+/, "") // buang deviceTag
    .replace("@lid", "@s.whatsapp.net")
    .replace(/[^0-9@]/g, ""); // filter karakter aneh
}

// 🔧 Ambil sender id
function getSenderId(msg) {
  if (msg.key.participant) return msg.key.participant;
  if (msg.participant) return msg.participant;
  return msg.key.remoteJid; // fallback
}

module.exports = async function kick(sock, msg, text, isGroup) {
  const groupId = msg.key.remoteJid;
  const senderId = normalizeJid(getSenderId(msg));
  const botId = normalizeJid(sock.user.id);

  if (!isGroup) {
    return sock.sendMessage(
      groupId,
      { text: "❌ Perintah ini hanya bisa digunakan di grup yaa~" },
      { quoted: msg }
    );
  }

  try {
    const metadata = await sock.groupMetadata(groupId);
    if (!metadata || !Array.isArray(metadata.participants)) {
      return sock.sendMessage(
        groupId,
        { text: "❌ Gagal mengambil data grup." },
        { quoted: msg }
      );
    }

    // Ambil daftar admin
    const adminList = metadata.participants
      .filter((p) => p.admin === "admin" || p.admin === "superadmin")
      .map((p) => normalizeJid(p.id));

    // Debug log warna
    console.log("👤 Sender:", chalk.yellow(senderId));
    console.log("🤖 BotId :", chalk.cyan(botId));
    console.log("👑 Admins:", chalk.green(JSON.stringify(adminList, null, 2)));

    // Cek admin
    const isSenderAdmin = adminList.includes(senderId);
    const isBotAdmin = adminList.includes(botId);

    if (!isSenderAdmin) {
      return sock.sendMessage(
        groupId,
        { text: "❌ Hanya admin grup yang boleh mengeluarkan member yaa~" },
        { quoted: msg }
      );
    }

    if (!isBotAdmin) {
      return sock.sendMessage(
        groupId,
        {
          text: "❌ Aku belum dijadikan admin grup ini, jadi gak bisa kick siapa-siapa 😥",
        },
        { quoted: msg }
      );
    }

    // 🔎 Tangkap reply / mention / input
    const quotedInfo = msg.message?.extendedTextMessage?.contextInfo;
    const repliedUser = quotedInfo?.participant;
    const mentionedJids = quotedInfo?.mentionedJid || [];

    const rawInput = text.split(" ").slice(1).join(" ");
    let targets = [];

    if (repliedUser) {
      targets.push(normalizeJid(repliedUser));
    } else if (mentionedJids.length > 0) {
      targets = mentionedJids.map((j) => normalizeJid(j));
    } else if (rawInput) {
      targets = rawInput.split(",").map((n) => {
        let num = n.trim().replace(/[^0-9]/g, "");
        if (num.startsWith("0")) num = "62" + num.slice(1);
        return num + "@s.whatsapp.net";
      });
    } else {
      return sock.sendMessage(
        groupId,
        {
          text: "❗ Gunakan dengan *reply pesan*, *tag user*, atau ketik: `.kick 628xxxx` / `.kick 628xxxx, 62xxxxx`",
        },
        { quoted: msg }
      );
    }

    // Filter biar gak nendang bot & sender
    const filteredTargets = targets.filter(
      (t) => t !== botId && t !== senderId
    );

    if (filteredTargets.length === 0) {
      return sock.sendMessage(
        groupId,
        {
          text: "❌ Tidak ada target valid untuk dikeluarkan. Jangan suruh aku ngeluarin diriku sendiri dong 😢",
        },
        { quoted: msg }
      );
    }

    const success = [];
    const failed = [];

    for (const target of filteredTargets) {
      try {
        await sock.groupParticipantsUpdate(groupId, [target], "remove");
        success.push(target);
      } catch (err) {
        failed.push(target);
      }
    }

    let responseText = "";

    if (success.length > 0) {
      responseText += `✅ Berhasil mengeluarkan:\n`;
      responseText += success.map((jid) => `@${jid.split("@")[0]}`).join("\n") + "\n\n";
    }

    if (failed.length > 0) {
      responseText += `❌ Gagal mengeluarkan:\n`;
      responseText += failed.map((jid) => `@${jid.split("@")[0]}`).join("\n");
    }

    return sock.sendMessage(
      groupId,
      {
        text: responseText.trim(),
        mentions: [...success, ...failed],
      },
      { quoted: msg }
    );
  } catch (err) {
    console.error("❌ Gagal kick member:", err);
    return sock.sendMessage(
      groupId,
      {
        text: "❌ Gagal mengeluarkan anggota. Pastikan bot adalah admin dan ID valid ya!",
      },
      { quoted: msg }
    );
  }
};
