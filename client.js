import { Keypair } from "@stellar/stellar-sdk";
import { Mppx } from "mppx/client";
import { stellar } from "@stellar/mpp/charge/client";
import dotenv from "dotenv";

dotenv.config();

const STELLAR_SECRET = process.env.STELLAR_SECRET;
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

if (!STELLAR_SECRET) {
  console.error("❌ Defina STELLAR_SECRET no arquivo .env");
  process.exit(1);
}

const keypair = Keypair.fromSecret(STELLAR_SECRET);
console.log(`\n🔑 Conta Stellar: ${keypair.publicKey()}`);
console.log(`🌐 Servidor: ${SERVER_URL}\n`);

Mppx.create({
  methods: [
    stellar.charge({
      keypair,
      mode: "pull",
      onProgress(event) {
        if (event.type === "challenge")
          console.log(`💳 Pagamento: ${event.amount} USDC`);
        if (event.type === "signing") console.log(`✍️  Assinando...`);
        if (event.type === "signed") console.log(`✅ Assinado!`);
      },
    }),
  ],
});

async function callTool(name, endpoint, params = "") {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`🔧 ${name}`);
  console.log(`${"=".repeat(50)}`);
  try {
    const url = `${SERVER_URL}${endpoint}${params ? "?" + params : ""}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(`📦 Status: ${response.status}`);
    console.log(`📄 Resposta:`, JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("🚀 StellarAgentTools v2.0 - Teste com dados REAIS\n");

  // Lista ferramentas
  const toolsRes = await fetch(`${SERVER_URL}/tools`);
  const tools = await toolsRes.json();
  console.log(`✅ ${tools.tools.length} ferramentas (todas com dados reais):\n`);
  for (const t of tools.tools) {
    console.log(`   • ${t.name} — ${t.description} (${t.price}) [${t.source}]`);
  }

  // 1. Crypto Price — REAL
  await callTool("Crypto Price (CoinGecko)", "/tools/crypto-price", "symbol=xlm");

  // 2. Wikipedia Summary — REAL
  await callTool("Wikipedia Summary", "/tools/wiki-summary", "topic=Stellar_(payment_network)&lang=en");

  // 3. Country Info — REAL
  await callTool("Country Info", "/tools/country-info", "name=Brazil");

  // 4. Random Joke — REAL
  await callTool("Random Joke", "/tools/random-joke", "lang=en");

  // 5. Dad Joke — REAL
  await callTool("Dad Joke", "/tools/dad-joke");

  // 6. Weather — REAL
  await callTool("Weather", "/tools/weather", "city=São Paulo&lat=-23.55&lon=-46.63");

  // 7. Exchange Rate — REAL
  await callTool("Exchange Rate", "/tools/exchange-rate", "from=USD&to=BRL");

  // 8. Generate Image — REAL
  await callTool("Generate Image", "/tools/generate-image", "prompt=A cute astronaut cat floating in space with Stellar logo");

  console.log(`\n${"=".repeat(50)}`);
  console.log("✅ Todos os testes com dados REAIS concluídos!");
  console.log(`💸 Total gasto: ~0.097 USDC`);
  console.log(`${"=".repeat(50)}\n`);
}

main().catch(console.error);
