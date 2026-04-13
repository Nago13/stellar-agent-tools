import { Keypair } from "@stellar/stellar-sdk";

const useFriendbot = process.argv.includes("--friendbot");

const keypair = Keypair.random();
const pub = keypair.publicKey();
const sec = keypair.secret();

console.log("🔑 Stellar testnet wallet");
console.log(`Public: ${pub}`);
console.log(`Secret: ${sec}`);

if (!useFriendbot) {
  console.log("\n💡 Add --friendbot to pre-fund with testnet XLM for fees.");
  process.exit(0);
}

async function fund() {
  try {
    const url = `https://friendbot.stellar.org/?addr=${encodeURIComponent(pub)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Friendbot error: ${res.status}`);
    const body = await res.text();
    console.log("\n✅ Funded with testnet XLM via friendbot.");
    console.log(body);
  } catch (err) {
    console.error("\n❌ Friendbot funding failed:", err.message);
    process.exit(1);
  }
}

fund();
