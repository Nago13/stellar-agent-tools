import express from "express";
import { Mppx } from "mppx/server";
import { stellar } from "@stellar/mpp/charge/server";
import { USDC_SAC_TESTNET } from "@stellar/mpp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";
import dotenv from "dotenv";

const require = createRequire(import.meta.url);
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3001;
const RECIPIENT = process.env.STELLAR_RECIPIENT;
const MPP_SECRET_KEY = process.env.MPP_SECRET_KEY;

if (!RECIPIENT) {
  console.error("❌ Defina STELLAR_RECIPIENT no arquivo .env");
  process.exit(1);
}
if (!MPP_SECRET_KEY) {
  console.error("❌ Defina MPP_SECRET_KEY no arquivo .env");
  process.exit(1);
}

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

// Converte request Express para Web Request (o MPP usa Web Request)
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

// ===== FERRAMENTA 1: Crypto Price (CoinGecko API - REAL) =====
app.get("/tools/crypto-price", async (req, res) => {
  const webReq = toWebRequest(req);
  const result = await mppx.charge({
    amount: "0.005",
    description: "Crypto Price Feed - Preços reais via CoinGecko",
  })(webReq);

  if (result.status === 402) {
    const challenge = result.challenge;
    challenge.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(402).send(await challenge.text());
  }

  const symbol = (req.query.symbol || "stellar").toLowerCase();
  const coinMap = {
    xlm: "stellar",
    stellar: "stellar",
    btc: "bitcoin",
    bitcoin: "bitcoin",
    eth: "ethereum",
    ethereum: "ethereum",
    sol: "solana",
    solana: "solana",
    usdc: "usd-coin",
  };
  const coinId = coinMap[symbol] || symbol;

  try {
    const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;
    const apiRes = await fetch(apiUrl);
    const apiData = await apiRes.json();

    const coinData = apiData[coinId];
    if (!coinData) {
      const response = result.withReceipt(
        Response.json({ error: "Moeda não encontrada", symbol })
      );
      response.headers.forEach((value, key) => res.setHeader(key, value));
      return res.status(response.status).send(await response.text());
    }

    const response = result.withReceipt(
      Response.json({
        symbol: symbol.toUpperCase(),
        price: coinData.usd,
        change24h: `${coinData.usd_24h_change?.toFixed(2)}%`,
        marketCap: coinData.usd_market_cap,
        timestamp: new Date().toISOString(),
        source: "CoinGecko API (real data)",
        cost: "0.005 USDC",
      })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  } catch (error) {
    const response = result.withReceipt(
      Response.json({ error: error.message, symbol })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  }
});

// ===== FERRAMENTA 2: Random Joke (JokeAPI - REAL) =====
app.get("/tools/random-joke", async (req, res) => {
  const webReq = toWebRequest(req);
  const result = await mppx.charge({
    amount: "0.001",
    description: "Random Joke - Piada aleatória via JokeAPI",
  })(webReq);

  if (result.status === 402) {
    const challenge = result.challenge;
    challenge.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(402).send(await challenge.text());
  }

  try {
    const lang = req.query.lang || "en";
    const apiRes = await fetch(
      `https://v2.jokeapi.dev/joke/Any?safe-mode&lang=${lang}`
    );
    const joke = await apiRes.json();

    const response = result.withReceipt(
      Response.json({
        category: joke.category,
        type: joke.type,
        joke: joke.type === "single" ? joke.joke : `${joke.setup} — ${joke.delivery}`,
        language: lang,
        source: "JokeAPI v2 (real data)",
        cost: "0.001 USDC",
      })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  } catch (error) {
    const response = result.withReceipt(
      Response.json({ error: error.message })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  }
});

// ===== FERRAMENTA 3: Wikipedia Summary (Wikipedia API - REAL) =====
app.get("/tools/wiki-summary", async (req, res) => {
  const webReq = toWebRequest(req);
  const result = await mppx.charge({
    amount: "0.01",
    description: "Wikipedia Summary - Resumo de artigos da Wikipedia",
  })(webReq);

  if (result.status === 402) {
    const challenge = result.challenge;
    challenge.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(402).send(await challenge.text());
  }

  const topic = req.query.topic || "Stellar_(payment_network)";
  const lang = req.query.lang || "en";

  try {
    const apiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
    const apiRes = await fetch(apiUrl);
    const data = await apiRes.json();

    const response = result.withReceipt(
      Response.json({
        title: data.title,
        summary: data.extract,
        url: data.content_urls?.desktop?.page || "",
        thumbnail: data.thumbnail?.source || null,
        language: lang,
        source: "Wikipedia REST API (real data)",
        cost: "0.01 USDC",
      })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  } catch (error) {
    const response = result.withReceipt(
      Response.json({ error: error.message, topic })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  }
});

// ===== FERRAMENTA 4: Dad Joke (icanhazdadjoke - REAL) =====
app.get("/tools/dad-joke", async (req, res) => {
  const webReq = toWebRequest(req);
  const result = await mppx.charge({
    amount: "0.001",
    description: "Dad Joke - Piada de pai via icanhazdadjoke",
  })(webReq);

  if (result.status === 402) {
    const challenge = result.challenge;
    challenge.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(402).send(await challenge.text());
  }

  try {
    const search = req.query.search;
    let apiUrl = "https://icanhazdadjoke.com/";
    if (search) apiUrl += `search?term=${encodeURIComponent(search)}`;

    const apiRes = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "StellarAgentTools (https://github.com/Nago13/stellar-agent-tools)",
      },
    });
    const data = await apiRes.json();

    const jokeText = search
      ? data.results?.[0]?.joke || "Nenhuma piada encontrada"
      : data.joke;

    const response = result.withReceipt(
      Response.json({
        joke: jokeText,
        id: search ? data.results?.[0]?.id : data.id,
        source: "icanhazdadjoke.com (real data)",
        cost: "0.001 USDC",
      })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  } catch (error) {
    const response = result.withReceipt(
      Response.json({ error: error.message })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  }
});

// ===== FERRAMENTA 5: Country Info (RestCountries API - REAL) =====
app.get("/tools/country-info", async (req, res) => {
  const webReq = toWebRequest(req);
  const result = await mppx.charge({
    amount: "0.005",
    description: "Country Info - Dados de países via RestCountries",
  })(webReq);

  if (result.status === 402) {
    const challenge = result.challenge;
    challenge.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(402).send(await challenge.text());
  }

  const country = req.query.name || "Brazil";

  try {
    const apiRes = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=name,capital,population,region,subregion,currencies,languages,flags`
    );
    const data = await apiRes.json();
    const c = data[0];

    const response = result.withReceipt(
      Response.json({
        name: c.name?.common,
        officialName: c.name?.official,
        capital: c.capital?.[0],
        population: c.population,
        region: c.region,
        subregion: c.subregion,
        currencies: c.currencies,
        languages: c.languages,
        flag: c.flags?.png,
        source: "RestCountries API (real data)",
        cost: "0.005 USDC",
      })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  } catch (error) {
    const response = result.withReceipt(
      Response.json({ error: error.message, country })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  }
});

// ===== FERRAMENTA 6: Weather (Open-Meteo API - REAL) =====
app.get("/tools/weather", async (req, res) => {
  const webReq = toWebRequest(req);
  const result = await mppx.charge({
    amount: "0.005",
    description: "Weather - Clima em tempo real via Open-Meteo",
  })(webReq);

  if (result.status === 402) {
    const challenge = result.challenge;
    challenge.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(402).send(await challenge.text());
  }

  const lat = req.query.lat || "-23.55";
  const lon = req.query.lon || "-46.63";
  const city = req.query.city || "São Paulo";

  try {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;
    const apiRes = await fetch(apiUrl);
    const data = await apiRes.json();

    const weatherCodes = {
      0: "Céu limpo", 1: "Parcialmente limpo", 2: "Parcialmente nublado",
      3: "Nublado", 45: "Neblina", 51: "Garoa leve", 61: "Chuva leve",
      63: "Chuva moderada", 65: "Chuva forte", 80: "Pancadas de chuva",
      95: "Tempestade",
    };

    const current = data.current;
    const response = result.withReceipt(
      Response.json({
        city,
        temperature: `${current.temperature_2m}°C`,
        humidity: `${current.relative_humidity_2m}%`,
        windSpeed: `${current.wind_speed_10m} km/h`,
        condition: weatherCodes[current.weather_code] || `Code ${current.weather_code}`,
        timestamp: current.time,
        source: "Open-Meteo API (real data)",
        cost: "0.005 USDC",
      })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  } catch (error) {
    const response = result.withReceipt(
      Response.json({ error: error.message })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  }
});

// ===== FERRAMENTA 7: Exchange Rate (ExchangeRate API - REAL) =====
app.get("/tools/exchange-rate", async (req, res) => {
  const webReq = toWebRequest(req);
  const result = await mppx.charge({
    amount: "0.003",
    description: "Exchange Rate - Câmbio em tempo real",
  })(webReq);

  if (result.status === 402) {
    const challenge = result.challenge;
    challenge.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(402).send(await challenge.text());
  }

  const from = (req.query.from || "USD").toUpperCase();
  const to = (req.query.to || "BRL").toUpperCase();

  try {
    const apiUrl = `https://open.er-api.com/v6/latest/${from}`;
    const apiRes = await fetch(apiUrl);
    const data = await apiRes.json();

    const rate = data.rates?.[to];
    if (!rate) {
      const response = result.withReceipt(
        Response.json({ error: `Moeda ${to} não encontrada`, from, to })
      );
      response.headers.forEach((value, key) => res.setHeader(key, value));
      return res.status(response.status).send(await response.text());
    }

    const response = result.withReceipt(
      Response.json({
        from,
        to,
        rate,
        example: `1 ${from} = ${rate.toFixed(4)} ${to}`,
        lastUpdate: data.time_last_update_utc,
        source: "ExchangeRate API (real data)",
        cost: "0.003 USDC",
      })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  } catch (error) {
    const response = result.withReceipt(
      Response.json({ error: error.message })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  }
});

// ===== FERRAMENTA 8: Image Generation (Nano Banana / Gemini - REAL) =====
app.get("/tools/generate-image", async (req, res) => {
  const webReq = toWebRequest(req);
  const result = await mppx.charge({
    amount: "0.05",
    description: "Image Generation - Geração de imagem via Nano Banana (Google Gemini)",
  })(webReq);

  if (result.status === 402) {
    const challenge = result.challenge;
    challenge.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(402).send(await challenge.text());
  }

  const prompt = req.query.prompt || "A futuristic city on the Stellar blockchain";

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY });

    const response_ai = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: prompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    let imageBase64 = null;
    let textResponse = null;

    for (const part of response_ai.candidates[0].content.parts) {
      if (part.text) {
        textResponse = part.text;
      } else if (part.inlineData) {
        imageBase64 = part.inlineData.data;
      }
    }

    const response = result.withReceipt(
      Response.json({
        prompt,
        hasImage: !!imageBase64,
        imageBase64: imageBase64 ? `data:image/png;base64,${imageBase64}` : null,
        textResponse: textResponse || null,
        model: "Nano Banana (Gemini)",
        source: "Google Gemini API (real data)",
        cost: "0.05 USDC",
      })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  } catch (error) {
    const response = result.withReceipt(
      Response.json({ error: error.message, prompt })
    );
    response.headers.forEach((value, key) => res.setHeader(key, value));
    return res.status(response.status).send(await response.text());
  }
});

// ===== Lista todas as ferramentas =====
app.get("/tools", (req, res) => {
  res.json({
    name: "StellarAgentTools",
    description: "Marketplace de ferramentas pagas para agentes IA via MPP na Stellar",
    version: "2.0.0",
    network: "stellar:testnet",
    currency: "USDC",
    tools: [
      {
        name: "crypto-price",
        endpoint: "/tools/crypto-price",
        description: "Preços reais de criptomoedas via CoinGecko",
        price: "0.005 USDC",
        params: { symbol: "XLM, BTC, ETH, SOL, USDC" },
        source: "CoinGecko API",
        dataType: "REAL",
      },
      {
        name: "wiki-summary",
        endpoint: "/tools/wiki-summary",
        description: "Resumos de artigos da Wikipedia em qualquer idioma",
        price: "0.01 USDC",
        params: { topic: "nome do artigo", lang: "en, pt, es..." },
        source: "Wikipedia REST API",
        dataType: "REAL",
      },
      {
        name: "country-info",
        endpoint: "/tools/country-info",
        description: "Dados completos de qualquer país do mundo",
        price: "0.005 USDC",
        params: { name: "nome do país em inglês" },
        source: "RestCountries API",
        dataType: "REAL",
      },
      {
        name: "random-joke",
        endpoint: "/tools/random-joke",
        description: "Piadas aleatórias em vários idiomas",
        price: "0.001 USDC",
        params: { lang: "en, de, cs, es, fr, pt" },
        source: "JokeAPI v2",
        dataType: "REAL",
      },
      {
        name: "dad-joke",
        endpoint: "/tools/dad-joke",
        description: "Piadas de pai (dad jokes) com busca por tema",
        price: "0.001 USDC",
        params: { search: "tema opcional" },
        source: "icanhazdadjoke.com",
        dataType: "REAL",
      },
      {
        name: "weather",
        endpoint: "/tools/weather",
        description: "Clima em tempo real de qualquer lugar do mundo",
        price: "0.005 USDC",
        params: { lat: "latitude", lon: "longitude", city: "nome da cidade" },
        source: "Open-Meteo API",
        dataType: "REAL",
      },
      {
        name: "exchange-rate",
        endpoint: "/tools/exchange-rate",
        description: "Câmbio de moedas em tempo real",
        price: "0.003 USDC",
        params: { from: "USD, EUR, BRL...", to: "BRL, USD, EUR..." },
        source: "ExchangeRate API",
        dataType: "REAL",
      },
      {
        name: "generate-image",
        endpoint: "/tools/generate-image",
        description: "Geração de imagens com IA via Nano Banana (Google Gemini)",
        price: "0.05 USDC",
        params: { prompt: "descrição da imagem em inglês" },
        source: "Google Gemini API (Nano Banana)",
        dataType: "REAL",
      },
    ],
  });
});

// Dashboard
app.get("/dashboard", (req, res) => {
  res.sendFile(join(__dirname, "dashboard.html"));
});

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "🚀 StellarAgentTools - Marketplace de ferramentas pagas para agentes IA",
    docs: "/tools",
    dashboard: "/dashboard",
    network: "Stellar Testnet",
    protocol: "MPP (Machine Payments Protocol)",
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 StellarAgentTools v2.0 server rodando!`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`📋 Ferramentas: http://localhost:${PORT}/tools`);
  console.log(`💰 Recebendo em: ${RECIPIENT.slice(0, 8)}...`);
  console.log(`🔗 Rede: Stellar Testnet | Moeda: USDC`);
  console.log(`\n📡 7 ferramentas com dados REAIS:`);
  console.log(`   • crypto-price   → CoinGecko API`);
  console.log(`   • wiki-summary   → Wikipedia API`);
  console.log(`   • country-info   → RestCountries API`);
  console.log(`   • random-joke    → JokeAPI v2`);
  console.log(`   • dad-joke       → icanhazdadjoke`);
  console.log(`   • weather        → Open-Meteo API`);
  console.log(`   • exchange-rate  → ExchangeRate API\n`);
});
