import { Server, Asset, Keypair } from "@stellar/stellar-sdk";

const secret = process.argv[2] || process.env.STELLAR_SECRET;
if (!secret) {
  console.error("Usage: node check-balance.js <S...>  (or set STELLAR_SECRET)");
  process.exit(1);
}

const server = new Server("https://horizon-testnet.stellar.org");
const keypair = Keypair.fromSecret(secret);
const pub = keypair.publicKey();
const USDC = new Asset("USDC", "CCPT5SO5IVIUQXMVKQYBYFM4GZK34NT2AJEEWGBVPRPC33RCLTGNMNTO"); // Circle USDC testnet issuer

async function main() {
  try {
    const account = await server.loadAccount(pub);
    const balances = account.balances.map((b) => {
      if (b.asset_type === "native") return { asset: "XLM", balance: b.balance };
      return { asset: `${b.asset_code}:${b.asset_issuer}`, balance: b.balance };
    });

    const xlm = balances.find((b) => b.asset === "XLM")?.balance || "0";
    const usdc = balances.find(
      (b) => b.asset === `${USDC.code}:${USDC.issuer}`
    )?.balance || "0";

    console.log(`🔑 ${pub}`);
    console.log(`XLM:  ${xlm}`);
    console.log(`USDC: ${usdc}`);
    console.log("\nAll balances:", balances);
  } catch (err) {
    console.error("❌ Failed to load account:", err.message);
    process.exit(1);
  }
}

main();
