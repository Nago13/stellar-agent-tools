# 🚀 StellarAgentTools

Paid tool marketplace for AI agents using the Stellar Machine Payments Protocol (MPP).

Built for [Stellar Hacks: Agents 2026](https://dorahacks.io/hackathon/stellar-agents-x402-stripe-mpp)

---

## 🎯 What is this?

StellarAgentTools is an open-source infrastructure that lets AI agents (Claude Desktop, Cursor, Claude Code, etc.) automatically discover and pay for tools using the **Machine Payments Protocol (MPP)** on the **Stellar** blockchain.

- ~5s finality
- ~$0.00001 fees per transaction
- Native USDC via Soroban SAC (Stellar Asset Contract)
- Official machine-to-machine payments with MPP

## 🏗️ Architecture
┌─────────────────────────────────────────────┐
│           AI AGENTS (Clients)               │
│  Claude Desktop · Cursor · Claude Code      │
└──────────────────┬──────────────────────────┘
                   │ MCP Protocol
                   ▼
┌─────────────────────────────────────────────┐
│          MCP SERVER (Discovery)             │
│  Lists tools · Prices · Descriptions        │
└──────────────────┬──────────────────────────┘
                   │ HTTP + MPP
                   ▼
┌─────────────────────────────────────────────┐
│        PAYMENT LAYER (MPP Charge)           │
│  HTTP 402 → USDC payment → Retry → 200      │
└──────────────────┬──────────────────────────┘
                   │ Soroban SAC transfer
                   ▼
┌─────────────────────────────────────────────┐
│             STELLAR TESTNET                 │
│  USDC · 5s finality · ~$0.00001 fees        │
└─────────────────────────────────────────────┘

## 🔧 Available Tools

| Tool | Description | Price |
|---|---|---|
| **AI Q&A** | Answers general questions with AI | 0.01 USDC |
| **Crypto Price** | Real-time crypto prices | 0.005 USDC |
| **Web Summary** | Summarizes a web page | 0.01 USDC |

## 💡 How it works

1. Agent connects to the MCP server to discover available tools.
2. When a tool is invoked, the server responds with **HTTP 402** (Payment Required) and the USDC price.
3. The MPP client builds and signs a Soroban SAC `transfer` on Stellar.
4. The server validates the payment, broadcasts it, and returns the tool result.
5. All in seconds, without API keys or manual setup.

## 🗂️ Repo layout (backend + web)

- `server.js`, `mcp-server.js`, `client.js`: backend + MCP tooling (Node 20+)
- `app/`: Next.js 16 frontend (App Router, Tailwind)
- `npm run dev`: sobe o backend
- `npm run web:dev`: sobe o frontend em `app/`
- `npm run web:build` / `npm run web:start`: build/preview do frontend

## 🚀 Quick start

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- A Stellar wallet with testnet USDC ([create here](https://lab.stellar.org/account/create))

### 1. Clone and install

```bash
git clone https://github.com/SEU_USUARIO/stellar-agent-tools.git
cd stellar-agent-tools
npm install
```

### 2. Configure environment

Create a `.env` file:

```env
STELLAR_RECIPIENT=G...  # Your Stellar public key
STELLAR_SECRET=S...     # Your Stellar secret key
MPP_SECRET_KEY=your-strong-mpp-secret
PORT=3001
```

### 3. Fund a Stellar testnet wallet

1. Create a keypair: https://lab.stellar.org/account/create  
2. Fund with XLM: https://lab.stellar.org/account/fund  
3. Add USDC trustline (button on the fund page)  
4. Get test USDC: https://faucet.circle.com (choose Stellar Testnet)

### 4. Run the server

```bash
node server.js
```

### 5. Try the sample client

```bash
node client.js
```

### 6. Use with Claude Desktop / Cursor (MCP)

Add to your MCP config:

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

## 🛠️ Tech stack

- **Runtime**: Node.js 20+
- **Server**: Express.js
- **Payments**: MPP via `@stellar/mpp`
- **Blockchain**: Stellar Testnet (Soroban SAC)
- **Currency**: USDC (testnet)
- **Agent protocol**: MCP via `@modelcontextprotocol/sdk`
- **MPP framework**: `mppx`

## 📊 Cost comparison

| Property | MCPay (EVM) | Stellar MPP (this project) |
|---|---|---|
| Chain | EVM (Base, etc.) | Stellar |
| Payment protocol | x402 | MPP |
| Finality | ~2–15s | ~5s |
| Typical fees | ~$0.001 | **~$0.00001** |

## 🗺️ Roadmap

- [x] MPP server with paid tools
- [x] Test client with automatic payment
- [x] MCP server for agent integration
- [ ] Web dashboard with transaction history
- [ ] MPP Session mode (off-chain channel)
- [ ] Tools with real AI backends (OpenAI, Claude API)
- [ ] Public tool registry
- [ ] On-chain reputation via Soroban

## 📜 License

MIT

## 🏆 Hackathon

Built for [Stellar Hacks: Agents 2026](https://dorahacks.io/hackathon/stellar-agents-x402-stripe-mpp) by the Stellar Development Foundation.

**Hackathon tech used:**
- ✅ Stellar Testnet
- ✅ MPP (Machine Payments Protocol)
- ✅ USDC via Soroban SAC
- ✅ MCP (Model Context Protocol)
- ✅ Autonomous AI agents
