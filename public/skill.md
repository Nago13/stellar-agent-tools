---
name: stellar-mpp-agent
version: 0.1.0
description: Unified skill for agent wallets and MPP-priced MCP tools on Stellar Testnet USDC.
homepage: https://lumina-stellar.vercel.app
metadata: {"mpp":{"supported":true,"networks":["stellar:testnet"],"tokens":["USDC_SAC_TESTNET"],"endpoint":"/tools/mpp-pay"},"x402":{"supported":false}}
---

# Stellar MPP Agent (Wallet + Tools)

Server-managed wallets for AI agents on Stellar Testnet USDC, plus paid MCP tools. Generates keys, funds XLM fees via friendbot, pays MPP-priced tools headlessly, and logs charge events.

---

## TL;DR — Quick reference

- Skill file: `https://lumina-stellar.vercel.app/skill.md`
- Wallet generator: `node skills/stellar-agent-tools/scripts/create-wallet.js --friendbot`
- Fund USDC: https://faucet.circle.com (choose Stellar Testnet) or transfer from another funded account.
- `.env`: `STELLAR_SECRET` (payer), `STELLAR_RECIPIENT` (receiver), `MPP_SECRET_KEY`, `PORT` (optional, defaults 3001), `SERVER_URL` (for client tests).
- Run paid API server: `node server.js` (tools require MPP payment)
- Run MCP wrapper: `node mcp-server.js` (agents discover/pay tools)
- Headless payment test: `node client.js` (pull-mode MPP, logs challenge/signing/signed)

---

## One-step flow to pay a tool (MPP)

The server uses MPP via `@stellar/mpp` and `mppx`. Call any tool endpoint; if it returns 402, the client pays and retries automatically.

Example (image generation):
```
Skill: https://lumina-stellar.vercel.app/skill.md
Endpoint: GET http://localhost:3000/tools/generate-image
Model: Nano Banana (Gemini 3.1 flash image preview)
Price: 0.05 USDC per image

Use x402/fetch-style flow with the Stellar agent wallet to pay via MPP. Ask what to generate and return the image (base64) plus the MPP receipt.
```

---

## Connect + fund

1) Generate wallet + fund XLM for fees:
```
node skills/stellar-agent-tools/scripts/create-wallet.js --friendbot
```
2) Add to `.env`:
```
STELLAR_SECRET=S...      # payer (agent wallet)
STELLAR_RECIPIENT=G...   # server recipient (or another account)
MPP_SECRET_KEY=strong-mpp-secret
PORT=3001
```
3) Add USDC (required to pay tools): https://faucet.circle.com (Stellar Testnet).

---

## Run services

- Paid API (MPP charges): `node server.js`
- MCP discovery wrapper: `node mcp-server.js`
- Test autopay: `node client.js`

Agents (Claude Desktop/Cursor): point MCP config to `mcp-server.js` (see README). Tools appear with prices; payments are signed server-side via MPP.

---

## Activity transparency

- Client logs: challenge → signing → signed (see `client.js` onProgress).
- Inspect account: `GET https://horizon-testnet.stellar.org/accounts/<PUBLIC_KEY>`
- Each tool response includes a receipt when paid.

---

## Safety

- Do not commit secrets. Rotate keys regularly for unattended agents.
- Friendbot only funds XLM (fees). You must add USDC separately to pay tools.
