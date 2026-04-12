import { Keypair } from "@stellar/stellar-sdk";
import { Mppx } from "mppx/client";
import { stellar } from "@stellar/mpp/charge/client";
import dotenv from "dotenv";

dotenv.config();

const STELLAR_SECRET = process.env.STELLAR_SECRET;
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3001";

if (!STELLAR_SECRET) {
  console.error("❌ Defina STELLAR_SECRET no arquivo .env (sua chave secreta S...)");
  process.exit(1);
}

const keypair = Keypair.fromSecret(STELLAR_SECRET);
console.log(`\n🔑 Usando conta Stellar: ${keypair.publicKey()}`);
console.log(`🌐 Servidor: ${SERVER_URL}\n`);

// Configura o MPP client - ele intercepta automaticamente respostas 402
// e faz o pagamento na blockchain Stellar
Mppx.create({
  methods: [
    stellar.charge({
      keypair,
      mode: "pull", // o servidor faz o broadcast da transação
      onProgress(event) {
        if (event.type === "challenge") {
          console.log(`💳 Pagamento solicitado: ${event.amount} USDC para ${event.recipient.slice(0, 8)}...`);
        } else if (event.type === "signing") {
          console.log(`✍️  Assinando transação...`);
        } else if (event.type === "signed") {
          console.log(`✅ Transação assinada!`);
        }
      },
    }),
  ],
});

// Função para chamar uma ferramenta
async function callTool(name, endpoint, params = "") {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`🔧 Chamando ferramenta: ${name}`);
  console.log(`${"=".repeat(50)}`);

  try {
    const url = `${SERVER_URL}${endpoint}${params ? "?" + params : ""}`;
    console.log(`📡 URL: ${url}`);

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

// Testa todas as ferramentas
async function main() {
  console.log("🚀 StellarAgentTools - Cliente de teste\n");

  // 1. Lista ferramentas disponíveis (grátis)
  console.log("📋 Buscando ferramentas disponíveis...");
  const toolsResponse = await fetch(`${SERVER_URL}/tools`);
  const tools = await toolsResponse.json();
  console.log(`✅ ${tools.tools.length} ferramentas encontradas:\n`);
  for (const tool of tools.tools) {
    console.log(`   • ${tool.name} - ${tool.description} (${tool.price})`);
  }

  // 2. Chama AI Q&A (0.01 USDC)
  await callTool(
    "AI Q&A",
    "/tools/ai-answer",
    "q=O que é o protocolo MPP da Stellar?"
  );

  // 3. Chama Crypto Price (0.005 USDC)
  await callTool(
    "Crypto Price",
    "/tools/crypto-price",
    "symbol=XLM"
  );

  // 4. Chama Web Summary (0.01 USDC)
  await callTool(
    "Web Summary",
    "/tools/web-summary",
    "url=https://stellar.org"
  );

  console.log(`\n${"=".repeat(50)}`);
  console.log("✅ Todos os testes concluídos!");
  console.log(`💸 Total gasto: ~0.025 USDC`);
  console.log(`${"=".repeat(50)}\n`);
}

main().catch(console.error);
