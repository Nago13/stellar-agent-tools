---
name: stellar-mpp-agent
description: >
  Skill to call paid tool endpoints on Stellar testnet via MPP.
  The agent wallet is in .env (STELLAR_SECRET). Use the paid-call.js script to call any tool.
---

# Stellar MPP Agent — Paid Tools

## How to call tools

Run this command — it handles wallet signing and payment automatically:

```bash
node skills/stellar-agent-tools/scripts/paid-call.js <endpoint> [key=value ...]
```

### Examples (copy and run directly):

```bash
# Crypto price — 0.005 USDC
node skills/stellar-agent-tools/scripts/paid-call.js /tools/crypto-price symbol=xlm

# Wikipedia summary — 0.01 USDC
node skills/stellar-agent-tools/scripts/paid-call.js /tools/wiki-summary topic=Bitcoin lang=en

# Country info — 0.005 USDC
node skills/stellar-agent-tools/scripts/paid-call.js /tools/country-info name=Brazil

# Random joke — 0.001 USDC
node skills/stellar-agent-tools/scripts/paid-call.js /tools/random-joke lang=en

# Dad joke — 0.001 USDC
node skills/stellar-agent-tools/scripts/paid-call.js /tools/dad-joke

# Weather — 0.005 USDC
node skills/stellar-agent-tools/scripts/paid-call.js /tools/weather city=Tokyo lat=35.68 lon=139.69

# Exchange rate — 0.003 USDC
node skills/stellar-agent-tools/scripts/paid-call.js /tools/exchange-rate from=USD to=BRL

# Generate image — 0.05 USDC
node skills/stellar-agent-tools/scripts/paid-call.js /tools/generate-image prompt=A+futuristic+city

# List all tools — FREE
node skills/stellar-agent-tools/scripts/paid-call.js /tools
```

**DO NOT use curl or wget** — they cannot handle MPP payment signing. Always use paid-call.js.

## Available tools

| Endpoint | Params | Price |
|----------|--------|-------|
| `/tools/crypto-price` | `symbol=xlm\|btc\|eth\|sol` | 0.005 USDC |
| `/tools/wiki-summary` | `topic=... lang=en\|pt\|es` | 0.01 USDC |
| `/tools/country-info` | `name=Brazil` | 0.005 USDC |
| `/tools/random-joke` | `lang=en\|pt\|es` | 0.001 USDC |
| `/tools/dad-joke` | `search=optional` | 0.001 USDC |
| `/tools/weather` | `city=... lat=... lon=...` | 0.005 USDC |
| `/tools/exchange-rate` | `from=USD to=BRL` | 0.003 USDC |
| `/tools/generate-image` | `prompt=...` | 0.05 USDC |
| `/tools` | *(none)* | FREE |

## Prerequisites

- `node server.js` must be running (port 3001)
- `.env` must have `STELLAR_SECRET` (agent wallet) with XLM + USDC balances

## Wallet scripts

```bash
# Create new wallet + fund XLM
node skills/stellar-agent-tools/scripts/create-wallet.js --friendbot

# Fund existing wallet with XLM
node skills/stellar-agent-tools/scripts/fund-friendbot.js

# Check balance
node skills/stellar-agent-tools/scripts/check-balance.js
```

Fund USDC testnet at https://faucet.circle.com (Stellar Testnet).
