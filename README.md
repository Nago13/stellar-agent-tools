# 🚀 StellarAgentTools

**Marketplace de ferramentas pagas para agentes de IA via MPP na Stellar**

Built for [Stellar Hacks: Agents 2026](https://dorahacks.io/hackathon/stellar-agents-x402-stripe-mpp)

---

## 🎯 O que é?

StellarAgentTools é uma infraestrutura open-source que permite que **agentes de IA** (como Claude Desktop, Cursor, Claude Code) **descubram e paguem por ferramentas automaticamente**, usando o **Machine Payments Protocol (MPP)** na blockchain **Stellar**.

Inspirado no [MCPay](https://github.com/microchipgnu/MCPay) e [Frames.ag](https://frames.ag), o StellarAgentTools traz esse conceito para o ecossistema Stellar, aproveitando:

- **Transações ultrarrápidas** (~5 segundos de finalidade)
- **Taxas quase zero** (~$0.00001 por transação)
- **USDC nativo** via Soroban SAC (Stellar Asset Contract)
- **MPP Protocol** — o protocolo de pagamento machine-to-machine oficial da Stellar

## 🏗️ Arquitetura
┌─────────────────────────────────────────────┐
│          AGENTES DE IA (Clientes)           │
│  Claude Desktop · Cursor · Claude Code      │
└──────────────────┬──────────────────────────┘
                   │ MCP Protocol
                   ▼
┌─────────────────────────────────────────────┐
│         MCP SERVER (Descoberta)             │
│  Lista ferramentas · Preços · Descrições    │
└──────────────────┬──────────────────────────┘
                   │ HTTP + MPP
                   ▼
┌─────────────────────────────────────────────┐
│      PAYMENT LAYER (MPP Charge)             │
│  HTTP 402 → Pagamento USDC → Retry → 200   │
└──────────────────┬──────────────────────────┘
                   │ Soroban SAC Transfer
                   ▼
┌─────────────────────────────────────────────┐
│          STELLAR TESTNET                    │
│  USDC · 5s finality · ~$0.00001 fees       │
└─────────────────────────────────────────────┘
## 🔧 Ferramentas Disponíveis

| Ferramenta | Descrição | Preço |
|---|---|---|
| **AI Q&A** | Responde perguntas usando IA | 0.01 USDC |
| **Crypto Price** | Preços de criptomoedas em tempo real | 0.005 USDC |
| **Web Summary** | Resumo inteligente de páginas web | 0.01 USDC |

## 💡 Como Funciona

1. O agente de IA se conecta ao MCP Server e descobre as ferramentas disponíveis
2. Quando o agente chama uma ferramenta, o servidor responde com **HTTP 402** (Payment Required) incluindo o preço em USDC
3. O cliente MPP automaticamente constrói e assina uma transação Soroban SAC `transfer` na Stellar
4. O servidor verifica o pagamento, faz broadcast na blockchain, e retorna o resultado
5. Tudo acontece em segundos, sem API keys, sem assinaturas, sem setup manual

## 🚀 Quick Start

### Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- Uma carteira Stellar com USDC testnet ([criar aqui](https://lab.stellar.org/account/create))

### 1. Clone e instale

```bash
git clone https://github.com/SEU_USUARIO/stellar-agent-tools.git
cd stellar-agent-tools
npm install
```

### 2. Configure o ambiente

Crie um arquivo `.env`:

```env
STELLAR_RECIPIENT=G...  # Sua chave pública Stellar
STELLAR_SECRET=S...     # Sua chave secreta Stellar
MPP_SECRET_KEY=sua-chave-secreta-mpp  # Qualquer string forte
PORT=3001
```

### 3. Configure a carteira Stellar Testnet

1. Crie um keypair: https://lab.stellar.org/account/create
2. Fund com XLM: https://lab.stellar.org/account/fund
3. Adicione trustline USDC (botão na página de fund)
4. Pegue USDC de teste: https://faucet.circle.com (selecione Stellar Testnet)

### 4. Rode o servidor

```bash
node server.js
```

### 5. Teste com o cliente

```bash
node client.js
```

### 6. Use com Claude Desktop / Cursor (MCP)

Adicione ao seu arquivo de configuração MCP:

```json
{
  "mcpServers": {
    "stellar-agent-tools": {
      "command": "node",
      "args": ["mcp-server.js"],
      "cwd": "/caminho/para/stellar-agent-tools"
    }
  }
}
```

## 🛠️ Stack Técnica

- **Runtime**: Node.js 20+
- **Server**: Express.js
- **Pagamentos**: MPP (Machine Payments Protocol) via `@stellar/mpp`
- **Blockchain**: Stellar Testnet (Soroban SAC)
- **Moeda**: USDC (testnet)
- **Agent Protocol**: MCP (Model Context Protocol) via `@modelcontextprotocol/sdk`
- **Framework MPP**: `mppx`

## 📊 Diferencial

| Feature | MCPay | Frames.ag | StellarAgentTools |
|---|---|---|---|
| Blockchain | EVM (Base, etc) | Solana | **Stellar** |
| Protocolo de pagamento | x402 | x402 | **MPP** |
| Tempo de transação | ~2-15s | ~0.4s | **~5s** |
| Taxas | ~$0.001 | ~$0.0005 | **~$0.00001** |
| MCP Server integrado | ❌ | ❌ | **✅** |
| Modo Session (off-chain) | ❌ | ❌ | **Roadmap** |

## 🗺️ Roadmap

- [x] Servidor MPP com ferramentas pagas
- [x] Cliente de teste com pagamento automático
- [x] MCP Server para integração com agentes
- [ ] Dashboard web com histórico de transações
- [ ] Modo MPP Session (canal de pagamento off-chain)
- [ ] Ferramentas com IA real (OpenAI, Claude API)
- [ ] Registry público de ferramentas
- [ ] Sistema de reputação on-chain via Soroban

## 📜 Licença

MIT

## 🏆 Hackathon

Projeto construído para o [Stellar Hacks: Agents 2026](https://dorahacks.io/hackathon/stellar-agents-x402-stripe-mpp) pela Stellar Development Foundation.

**Tecnologias do hackathon utilizadas:**
- ✅ Stellar Testnet
- ✅ MPP (Machine Payments Protocol)
- ✅ USDC via Soroban SAC
- ✅ MCP (Model Context Protocol)
- ✅ Agentes de IA autônomos
