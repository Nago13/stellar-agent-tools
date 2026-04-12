import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Keypair } from "@stellar/stellar-sdk";
import { Mppx } from "mppx/client";
import { stellar } from "@stellar/mpp/charge/client";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const STELLAR_SECRET = process.env.STELLAR_SECRET;
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3001";

if (!STELLAR_SECRET) {
  console.error("❌ Defina STELLAR_SECRET no arquivo .env");
  process.exit(1);
}

// Configura o MPP client para pagamentos automáticos
const keypair = Keypair.fromSecret(STELLAR_SECRET);

Mppx.create({
  methods: [
    stellar.charge({
      keypair,
      mode: "pull",
    }),
  ],
});

// Cria o MCP Server
const server = new McpServer({
  name: "StellarAgentTools",
  version: "1.0.0",
});

// ===== TOOL 1: AI Q&A =====
server.tool(
  "ai_answer",
  "Responde perguntas usando IA. Custa 0.01 USDC por chamada, pago automaticamente via MPP na Stellar.",
  {
    question: z.string().describe("A pergunta que você quer responder"),
  },
  async ({ question }) => {
    try {
      const url = `${SERVER_URL}/tools/ai-answer?q=${encodeURIComponent(question)}`;
      const response = await fetch(url);
      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Erro ao chamar AI Q&A: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ===== TOOL 2: Crypto Price =====
server.tool(
  "crypto_price",
  "Retorna o preço atual de uma criptomoeda. Custa 0.005 USDC por chamada, pago automaticamente via MPP na Stellar.",
  {
    symbol: z
      .string()
      .describe("Símbolo da criptomoeda (ex: XLM, BTC, ETH, USDC)"),
  },
  async ({ symbol }) => {
    try {
      const url = `${SERVER_URL}/tools/crypto-price?symbol=${encodeURIComponent(symbol)}`;
      const response = await fetch(url);
      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Erro ao buscar preço: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ===== TOOL 3: Web Summary =====
server.tool(
  "web_summary",
  "Gera um resumo inteligente de uma página web. Custa 0.01 USDC por chamada, pago automaticamente via MPP na Stellar.",
  {
    url: z.string().describe("URL da página para resumir"),
  },
  async ({ url }) => {
    try {
      const fetchUrl = `${SERVER_URL}/tools/web-summary?url=${encodeURIComponent(url)}`;
      const response = await fetch(fetchUrl);
      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Erro ao resumir página: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ===== TOOL 4: List Tools (grátis) =====
server.tool(
  "list_tools",
  "Lista todas as ferramentas disponíveis no marketplace com seus preços. Gratuito.",
  {},
  async () => {
    try {
      const response = await fetch(`${SERVER_URL}/tools`);
      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Erro ao listar ferramentas: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Inicia o servidor MCP via stdio
const transport = new StdioServerTransport();
await server.connect(transport);
