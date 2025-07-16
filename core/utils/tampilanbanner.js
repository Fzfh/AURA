const chalk = require("chalk");
const figlet = require("figlet");
const gradient = require("gradient-string");
const boxen = require("boxen").default;
const terminalWidth = process.stdout.columns || 80;

function centerText(text) {
  const lines = text.split("\n");
  return lines
    .map(line => {
      const pad = Math.max(0, Math.floor((terminalWidth - line.length) / 2));
      return " ".repeat(pad) + line;
    })
    .join("\n");
}

function tampilkanBanner(botName = "AURABOT") {
  console.clear();

  const banner = figlet.textSync(botName, {
    font: "Standard",
    horizontalLayout: "default",
    verticalLayout: "default",
  });

  console.log("\n" + gradient.pastel.multiline(centerText(banner)) + "\n");

  const info = chalk.whiteBright.bold(
    `${chalk.green("🟢 STATUS:")} Menunggu login ke WhatsApp\n\n` +
    `${chalk.cyan("📲 PILIH METODE LOGIN:")}\n` +
    `   ▶ ${chalk.bold("node start --qrcode")}  ${chalk.dim("// QR Code login")}\n` +
    `   ▶ ${chalk.bold("node start --prcode=628xxxx")}  ${chalk.dim("// Pairing Code login")}\n\n` +
    `${chalk.yellow("💡 CATATAN:")}\n` +
    ` - Jangan pakai ${chalk.red("+62")}, spasi, atau ${chalk.red("08xxx")}\n` +
    ` - Gunakan format: ${chalk.greenBright("628xxxxxx")}`
  );

  const box = boxen(info, {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "cyan",
    title: `✨ ${botName} Terminal`,
    titleAlignment: "center",
  });


  const boxLines = box.split("\n");
  boxLines.forEach(line => {
    const pad = Math.max(0, Math.floor((terminalWidth - line.length) / 2));
    console.log(" ".repeat(pad) + line);
  });

  const credit = "📛 BOT BY FAZRI";
  console.log("\n" + centerText(gradient.instagram(credit)) + "\n");
}

module.exports = tampilkanBanner;
