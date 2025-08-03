const chalk = require("chalk");
const figlet = require("figlet");
const gradient = require("gradient-string");
const boxen = require("boxen").default;
const terminalWidth = process.stdout.columns || 80;

function centerText(text) {
  return text
    .split("\n")
    .map(line => {
      const pad = Math.max(0, Math.floor((terminalWidth - line.length) / 2));
      return " ".repeat(pad) + line;
    })
    .join("\n");
}

function tampilkanBanner(botName = "AURABOT") {
  console.clear();

  // 1. BANNER BESAR
  const banner = figlet.textSync(botName, {
    font: "Standard",
    horizontalLayout: "default",
    verticalLayout: "default",
  });

  console.log("\n" + gradient.pastel.multiline(centerText(banner)) + "\n");

  // 2. ISI KOTAK BOXEN
  const infoLines = [
    `${chalk.green("🟢 STATUS:")} ${chalk.whiteBright.bold("Menunggu login ke WhatsApp")}`,
    "",
    `${chalk.cyan("📲 PILIH METODE LOGIN:")}`,
    `   ▶ ${chalk.bold("node start --qrcode")}  ${chalk.dim("// QR Code login")}`,
    `   ▶ ${chalk.bold("node start --prcode=628xxxx")}  ${chalk.dim("// Pairing Code login")}`,
    "",
    `${chalk.yellow("💡 CATATAN:")}`,
    ` - Jangan pakai ${chalk.red("+62")}, spasi, atau ${chalk.red("08xxx")}`,
    ` - Gunakan format: ${chalk.greenBright("628xxxxxx")}`,
  ];

  const infoBox = boxen(infoLines.join("\n"), {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "cyan",
    title: `✨ ${botName} Terminal`,
    titleAlignment: "center",
  });

  // 3. CETAK BOX DI TENGAH
  console.log(centerText(infoBox));

  // 4. CREDIT
  const credit = "📛 BOT BY FAZRI";
  console.log("\n" + centerText(gradient.instagram(credit)) + "\n");
}

module.exports = tampilkanBanner;
