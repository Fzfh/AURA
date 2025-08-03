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

function centerTextBox(boxString) {
  const lines = boxString.split("\n");
  const longest = Math.max(...lines.map(line => line.length));
  return lines
    .map(line => {
      const pad = Math.floor((terminalWidth - longest) / 2);
      return " ".repeat(pad) + line;
    })
    .join("\n");
}

function tampilkanBanner(botName = "AURABOT") {
  console.clear();

  // 1. BANNER FIGLET
  const banner = figlet.textSync(botName, {
    font: "Standard",
    horizontalLayout: "default",
    verticalLayout: "default",
  });

  console.log("\n" + gradient.pastel.multiline(centerText(banner)) + "\n");

  // 2. ISI BOX INFO (buat setiap baris seimbang lebar)
  const linePad = "  "; // padding kiri tiap baris biar gak nempel dinding
  const infoLines = [
    `${linePad}${chalk.green("🟢 STATUS:")} ${chalk.whiteBright.bold("Menunggu login ke WhatsApp")}`,
    "",
    `${linePad}${chalk.cyan("📲 PILIH METODE LOGIN:")}`,
    `${linePad}▶ ${chalk.bold("node start --qrcode")}         ${chalk.dim("// QR Code login")}`,
    `${linePad}▶ ${chalk.bold("node start --prcode=628xxxx")} ${chalk.dim("// Pairing Code login")}`,
    "",
    `${linePad}${chalk.yellow("💡 CATATAN:")}`,
    `${linePad}- Jangan pakai ${chalk.red("+62")}, spasi, atau ${chalk.red("08xxx")}`,
    `${linePad}- Gunakan format: ${chalk.greenBright("628xxxxxx")}`,
  ];

  const boxed = boxen(infoLines.join("\n"), {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "cyan",
    title: `✨ ${botName} Terminal`,
    titleAlignment: "center",
  });

  // 3. CETAK BOX YANG UDAH DITENGAHKAN
  console.log(centerTextBox(boxed));

  // 4. KREDIT
  const credit = "📛 BOT BY FAZRI";
  console.log("\n" + centerText(gradient.instagram(credit)) + "\n");
}

module.exports = tampilkanBanner;
