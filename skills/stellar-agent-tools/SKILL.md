---
name: stellar-mpp-agent
description: Unified skill to create/fund Stellar testnet wallets and run the paid MCP tool server with MPP (USDC). Use to bootstrap an agent wallet, pay tools, and expose them to MCP apps.
---

# Stellar MPP Agent (Wallet + Tools)

## When to use
- You need an agent wallet on Stellar testnet USDC (XLM fees via friendbot) to pay MPP-priced tools.
- You want to run the paid tool server and MCP wrapper so agents (Claude Desktop/Cursor) can discover and pay automatically.
- You want to log charge events and operate headlessly.

## Prerequisites
- Node.js 20+
- Stellar testnet wallet (generate below) and USDC testnet (Circle faucet) + XLM for fees (friendbot).

## Setup
1) Install deps: `npm install`
2) Create `.env` in repo root (receiver + payer):
```
STELLAR_RECIPIENT=G...    # receiver for tool payments
STELLAR_SECRET=S...       # agent wallet secret (payer)
MPP_SECRET_KEY=strong-mpp-secret
PORT=3001                 # optional
SERVER_URL=http://localhost:3001
```
3) Generate wallet + fund XLM (choose one):
- New wallet + friendbot: `node skills/stellar-agent-tools/scripts/create-wallet.js --friendbot`
- Fund existing S... with friendbot: `node skills/stellar-agent-tools/scripts/fund-friendbot.js S...`
4) Check balances (needs Horizon): `node skills/stellar-agent-tools/scripts/check-balance.js S...`
4) Fund USDC: https://faucet.circle.com (Stellar Testnet) or transfer from another account.

## Run services
- Paid API with MPP charges: `node server.js`
- MCP discovery wrapper (for agents): `node mcp-server.js`
- Headless autopay test (payer): `node client.js`
  - Uses `STELLAR_SECRET` to sign/pay challenges automatically
  - Logs: challenge headers → signed tx → receipt

## MCP config (Claude Desktop/Cursor)
```json
{
  "mcpServers": {
    "stellar-agent-tools": {
      "command": "node",
      "args": ["mcp-server.js"],
      "cwd": "/path/to/stellar-agent-tools"
    }
  }
}
```

## Tool endpoints (MPP)
- Image (Nano Banana / Gemini): `GET http://localhost:3001/tools/generate-image` — 0.05 USDC
- Crypto Price: `GET http://localhost:3001/tools/crypto-price` — 0.005 USDC
- Web Summary: `GET http://localhost:3001/tools/wiki-summary` — 0.01 USDC
- (See `/tools` for the full list and prices.)

Use x402/fetch-style flow with the agent wallet to pay via MPP; responses include receipts when paid.

## Payer vs Receiver (make sure both are set)
- `STELLAR_SECRET`: wallet that PAYS (needs XLM for fees + USDC for tools).
- `STELLAR_RECIPIENT`: wallet that RECEIVES payments (set to the merchant).
- Test payer flow headlessly: `node client.js` and watch the charge → sign → submit → receipt.

## Troubleshooting
- Ensure wallet has XLM (fees) + USDC (tool payment).
- Make sure `MPP_SECRET_KEY` matches server/client.
- Update prices or add tools in `server.js`, then restart.
