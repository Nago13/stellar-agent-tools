import express from "express";
import { Mppx } from "mppx/server";
import { stellar } from "@stellar/mpp/charge/server";
import { USDC_SAC_TESTNET } from "@stellar/mpp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const PORT = process.env.PORT || 3001;
const RECIPIENT = process.env.STELLAR_RECIPIENT;
const MPP_SECRET_KEY = process.env.MPP_SECRET_KEY;

if (!RECIPIENT) {
  console.error("❌ Defina STELLAR_RECIPIENT no arquivo .env (sua chave pública G...)");
  process.exit(1);
}

if (!MPP_SECRET_KEY) {
  console.error("❌ Defina MPP_SECRET_KEY no arquivo .env");
  process.exit(1);
}

// Cria a instância MPP que vai gerenciar os pagamentos
const mppx = Mppx.create({
  secretKey: MPP_SECRET_KEY,
  methods: [
    stellar.charge({
      recipient: RECIPIENT,
      currency: USDC_SAC_TESTNET,
      network: "stellar:testnet",
    }),
  ],
});

const app = express();
app.use(express.json());

// Função auxiliar: converte request do Express para Web Request
// (o MPP usa o padrão Web Request, mas o Express usa outro formato)
function toWebRequest(req) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const entry of value) headers.append(key, entry);
    } else {
      headers.set(key, value);
    }
  }
  return new Request(`http://localhost:${PORT}${req.url}`, {
    method: req.method,
    headers,
  });
}

// Função auxiliar: envia resposta Web Response de volta pelo Express
function sendWebResponse(res, webResponse) {
  webResponse.headers.forEach((value, key) => res.setHeader(key, value));
  return res.status(webResponse.status);
}

// ===== FERRAMENTA 1: AI Q&A =====
// Um endpoint que responde perguntas usando IA (simulado)
// Custa 0.01 USDC por chamada
app.get("/tools/ai-answer", async (req, res) => {
  const webReq = toWebRequest(req);
  const result = await mppx.charge({
    amount: "0.01",
    description: "AI Q&A - Resposta inteligente a perguntas",
  })(webReq);

  // Se não pagou ainda, retorna 402 (Payment Required)
  if (result.status === 402) {
    const challenge = result.challenge;
    challenge.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(402).send(await challenge.text());
  }

  // Se pagou, retorna o conteúdo
  const question = req.query.q || "Qual é o sentido da vida?";
  const answer = {
    question: question,
    answer: `[AI Response] Sobre "${question}": Esta é uma resposta gerada pela ferramenta AI Q&A do StellarAgentTools. Em produção, isso seria conectado a um LLM real.`,
    model: "stellar-ai-v1",
    cost: "0.01 USDC",
  };

  const response = result.withReceipt(Response.json(answer));
  response.headers.forEach((value, key) => res.setHeader(key, value));
  return res.status(response.status).send(await response.text());
});

// ===== FERRAMENTA 2: Crypto Price =====
// Retorna preço simulado de criptomoedas
// Custa 0.005 USDC por chamada
app.get("/tools/crypto-price", async (req, res) => {
  const webReq = toWebRequest(req);
  const result = await mppx.charge({
    amount: "0.005",
    description: "Crypto Price Feed - Preços em tempo real",
  })(webReq);

  if (result.status === 402) {
    const challenge = result.challenge;
    challenge.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(402).send(await challenge.text());
  }

  const symbol = (req.query.symbol || "XLM").toUpperCase();
  const prices = {
    XLM: { price: 0.42, change24h: "+3.2%" },
    BTC: { price: 98750.00, change24h: "+1.8%" },
    ETH: { price: 3850.00, change24h: "-0.5%" },
    USDC: { price: 1.00, change24h: "0.0%" },
  };

  const data = prices[symbol] || { price: 0, change24h: "N/A", error: "Token não encontrado" };

  const response = result.withReceipt(
    Response.json({
      symbol,
      ...data,
      timestamp: new Date().toISOString(),
      source: "StellarAgentTools Price Feed",
      cost: "0.005 USDC",
    })
  );
  response.headers.forEach((value, key) => res.setHeader(key, value));
  return res.status(response.status).send(await response.text());
});

// ===== FERRAMENTA 3: Web Summary =====
// Simula um resumo de página web
// Custa 0.01 USDC por chamada
app.get("/tools/web-summary", async (req, res) => {
  const webReq = toWebRequest(req);
  const result = await mppx.charge({
    amount: "0.01",
    description: "Web Summary - Resumo inteligente de páginas",
  })(webReq);

  if (result.status === 402) {
    const challenge = result.challenge;
    challenge.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(402).send(await challenge.text());
  }

  const url = req.query.url || "https://stellar.org";
  const response = result.withReceipt(
    Response.json({
      url,
      summary: `[Resumo] Conteúdo da página ${url}: Esta ferramenta em produção usaria web scraping + IA para gerar resumos reais de qualquer URL.`,
      wordCount: 150,
      language: "pt-BR",
      cost: "0.01 USDC",
    })
  );
  response.headers.forEach((value, key) => res.setHeader(key, value));
  return res.status(response.status).send(await response.text());
});

// ===== ROTA: Lista todas as ferramentas disponíveis =====
app.get("/tools", (req, res) => {
  res.json({
    name: "StellarAgentTools",
    description: "Marketplace de ferramentas pagas para agentes IA via MPP na Stellar",
    version: "1.0.0",
    network: "stellar:testnet",
    currency: "USDC",
    tools: [
      {
        name: "ai-answer",
        endpoint: "/tools/ai-answer",
        description: "Responde perguntas usando IA",
        price: "0.01 USDC",
        params: { q: "sua pergunta" },
      },
      {
        name: "crypto-price",
        endpoint: "/tools/crypto-price",
        description: "Retorna preço de criptomoedas",
        price: "0.005 USDC",
        params: { symbol: "XLM, BTC, ETH, USDC" },
      },
      {
        name: "web-summary",
        endpoint: "/tools/web-summary",
        description: "Gera resumo inteligente de páginas web",
        price: "0.01 USDC",
        params: { url: "URL da página" },
      },
    ],
  });
});

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "🚀 StellarAgentTools - Marketplace de ferramentas pagas para agentes IA",
    docs: "/tools",
    network: "Stellar Testnet",
    protocol: "MPP (Machine Payments Protocol)",
  });
});

// Servir o dashboard
app.get("/dashboard", (req, res) => {
  res.sendFile(join(__dirname, "dashboard.html"));
});

app.listen(PORT, () => {
  console.log(`\n🚀 StellarAgentTools server rodando!`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📋 Lista de ferramentas: http://localhost:${PORT}/tools`);
  console.log(`💰 Recebendo pagamentos em: ${RECIPIENT.slice(0, 8)}...`);
  console.log(`🔗 Rede: Stellar Testnet | Moeda: USDC\n`);
});
