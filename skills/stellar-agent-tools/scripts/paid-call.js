#!/usr/bin/env node
/**
 * paid-call.js — Wrapper for agents to call any MPP-paid tool endpoint.
 *
 * Usage:
 *   node skills/stellar-agent-tools/scripts/paid-call.js <endpoint> [key=value ...]
 *
 * Examples:
 *   node skills/stellar-agent-tools/scripts/paid-call.js /tools/crypto-price symbol=xlm
 *   node skills/stellar-agent-tools/scripts/paid-call.js /tools/dad-joke
 *   node skills/stellar-agent-tools/scripts/paid-call.js /tools/weather city=Tokyo lat=35.68 lon=139.69
 *   node skills/stellar-agent-tools/scripts/paid-call.js /tools/wiki-summary topic=Bitcoin lang=en
 *   node skills/stellar-agent-tools/scripts/paid-call.js /tools/exchange-rate from=USD to=BRL
 *   node skills/stellar-agent-tools/scripts/paid-call.js /tools/generate-image prompt=A+cute+cat
 *   node skills/stellar-agent-tools/scripts/paid-call.js /tools (free — lists all tools)
 */

import { Keypair } from "@stellar/stellar-sdk";
import { Mppx } from "mppx/client";
import { stellar } from "@stellar/mpp/charge/client";
import dotenv from "dotenv";

dotenv.config();

const STELLAR_SECRET = process.env.STELLAR_SECRET;
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

if (!STELLAR_SECRET) {
  console.error("ERROR: STELLAR_SECRET not set in .env");
  process.exit(1);
}

// Setup: polyfill fetch with MPP auto-pay
const keypair = Keypair.fromSecret(STELLAR_SECRET);
Mppx.create({
  methods: [
    stellar.charge({
      keypair,
      mode: "pull",
    }),
  ],
});

// Parse CLI args: first arg is endpoint, rest are key=value params
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node paid-call.js <endpoint> [key=value ...]");
  console.error("Example: node paid-call.js /tools/crypto-price symbol=xlm");
  process.exit(1);
}

const endpoint = args[0];
const params = {};
for (const arg of args.slice(1)) {
  const eq = arg.indexOf("=");
  if (eq > 0) {
    params[arg.slice(0, eq)] = arg.slice(eq + 1);
  }
}

// Build URL
const url = new URL(endpoint, SERVER_URL);
for (const [key, value] of Object.entries(params)) {
  url.searchParams.set(key, value);
}

// Call — fetch is polyfilled, handles 402 → sign → retry automatically
try {
  const res = await fetch(url.toString());
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
} catch (error) {
  console.error("ERROR:", error.message);
  process.exit(1);
}
