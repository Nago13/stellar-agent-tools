import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Keypair } from "@stellar/stellar-sdk";
import { Mppx } from "mppx/client";
import { stellar } from "@stellar/mpp/charge/client";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const STELLAR_SECRET = process.env.STELLAR_SECRET;
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

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

function formatResponse(payload) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

function formatError(message) {
  return {
    content: [
      {
        type: "text",
        text: message,
      },
    ],
    isError: true,
  };
}

async function fetchTool(path, params = {}) {
  const url = new URL(path, SERVER_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
  const response = await fetch(url.toString());
  return response.json();
}

function registerTool(config) {
  const inputSchema = config.schema ?? z.object({});

  server.registerTool(
    config.name,
    {
      title: config.label,
      description: config.description,
      inputSchema,
    },
    async (input) => {
      try {
        const mergedParams = { ...(config.defaults ?? {}) };
        for (const [key, value] of Object.entries(input ?? {})) {
          if (value === undefined) continue;
          mergedParams[key] = value;
        }

        const payload = await fetchTool(config.endpoint, mergedParams);
        return formatResponse(payload);
      } catch (error) {
        return formatError(`Erro ao chamar ${config.label}: ${error.message}`);
      }
    }
  );
}

const tools = [
  {
    name: "crypto_price",
    label: "Crypto Price",
    description:
      "Retorna o preço atual de uma criptomoeda. Custa 0.005 USDC por chamada, pago automaticamente via MPP na Stellar.",
    endpoint: "/tools/crypto-price",
    schema: z.object({
      symbol: z
        .string()
        .describe("Símbolo da criptomoeda (ex: XLM, BTC, ETH, USDC)")
        .optional(),
    }),
    defaults: { symbol: "xlm" },
  },
  {
    name: "wiki_summary",
    label: "Wikipedia Summary",
    description:
      "Retorna um resumo de um artigo da Wikipedia. Custa 0.01 USDC por chamada, pago automaticamente via MPP na Stellar.",
    endpoint: "/tools/wiki-summary",
    schema: z.object({
      topic: z.string().describe("Título da página ou termo (ex: Stellar_(payment_network))").optional(),
      lang: z.string().describe("Idioma do resumo (ex: en, pt, es)").optional(),
    }),
    defaults: { topic: "Stellar_(payment_network)", lang: "en" },
  },
  {
    name: "country_info",
    label: "Country Info",
    description: "Retorna dados completos de um país. Custa 0.005 USDC por chamada.",
    endpoint: "/tools/country-info",
    schema: z.object({
      name: z.string().describe("Nome do país em inglês").optional(),
    }),
    defaults: { name: "Brazil" },
  },
  {
    name: "random_joke",
    label: "Random Joke",
    description: "Piadas aleatórias em vários idiomas. Custa 0.001 USDC por chamada.",
    endpoint: "/tools/random-joke",
    schema: z.object({
      lang: z.string().describe("Idioma da piada (ex: en, pt, es)").optional(),
    }),
    defaults: { lang: "en" },
  },
  {
    name: "dad_joke",
    label: "Dad Joke",
    description: "Piadas de pai (dad jokes) com busca por tema. Custa 0.001 USDC por chamada.",
    endpoint: "/tools/dad-joke",
    schema: z.object({
      search: z.string().describe("Tema ou palavra-chave (opcional)").optional(),
    }),
    defaults: {},
  },
  {
    name: "weather",
    label: "Weather",
    description: "Clima em tempo real. Custa 0.005 USDC por chamada, pago automaticamente via MPP na Stellar.",
    endpoint: "/tools/weather",
    schema: z.object({
      city: z.string().describe("Nome da cidade").optional(),
      lat: z.string().describe("Latitude (ex: -23.55)").optional(),
      lon: z.string().describe("Longitude (ex: -46.63)").optional(),
    }),
    defaults: { city: "São Paulo", lat: "-23.55", lon: "-46.63" },
  },
  {
    name: "exchange_rate",
    label: "Exchange Rate",
    description: "Taxas de câmbio em tempo real. Custa 0.003 USDC por chamada.",
    endpoint: "/tools/exchange-rate",
    schema: z.object({
      from: z.string().describe("Moeda de origem (ex: USD)").optional(),
      to: z.string().describe("Moeda de destino (ex: BRL)").optional(),
    }),
    defaults: { from: "USD", to: "BRL" },
  },
  {
    name: "generate_image",
    label: "Generate Image",
    description:
      "Gera imagens com IA via Nano Banana (Google Gemini). Custa 0.05 USDC por chamada.",
    endpoint: "/tools/generate-image",
    schema: z.object({
      prompt: z.string().describe("Descrição em inglês da imagem").optional(),
    }),
    defaults: { prompt: "A futuristic city on the Stellar blockchain" },
  },
];

for (const tool of tools) {
  registerTool(tool);
}

server.tool(
  "list_tools",
  "Lista todas as ferramentas disponíveis no marketplace com seus preços. Gratuito.",
  {},
  async () => {
    try {
      const response = await fetch(`${SERVER_URL}/tools`);
      const data = await response.json();
      return formatResponse(data);
    } catch (error) {
      return formatError(`Erro ao listar ferramentas: ${error.message}`);
    }
  }
);

// Inicia o servidor MCP via stdio
const transport = new StdioServerTransport();
await server.connect(transport);
