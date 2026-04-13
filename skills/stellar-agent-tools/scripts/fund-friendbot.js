import { Keypair } from "@stellar/stellar-sdk";

const existingSecret = process.argv.find((arg) => arg.startsWith("S"));
const secret = existingSecret || process.env.STELLAR_SECRET;

let keypair;
if (secret) {
  keypair = Keypair.fromSecret(secret);
  console.log("Using existing secret from args/env.");
} else {
  keypair = Keypair.random();
  console.log("Generated new keypair.");
}

const pub = keypair.publicKey();
const sec = keypair.secret();

console.log("🔑 Public:", pub);
console.log("🔒 Secret:", sec);

async function fund() {
  try {
    const url = `https://friendbot.stellar.org/?addr=${encodeURIComponent(pub)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Friendbot error: ${res.status}`);
    await res.text();
    console.log("✅ Funded with testnet XLM via friendbot.");
  } catch (err) {
    console.error("❌ Funding failed:", err.message);
    process.exit(1);
  }
}

fund();
