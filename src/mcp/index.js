#!/usr/bin/env node

/**
 * agent-pay MCP Server
 *
 * Enables any Claude Code / Claude Desktop user to add payment
 * capabilities to their AI agents. When a user says "I want my
 * agent to pay for something", Claude can use these tools directly.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ethers } from "ethers";

// Base L2 config
const BASE_RPC = "https://mainnet.base.org";
const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

// State
let wallet = null;
let provider = null;
let usdc = null;
let isTestnet = true; // Default to testnet for safety

const server = new Server(
  { name: "agent-pay", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "agent_pay_create_wallet",
      description:
        "Create a new wallet for an AI agent to send and receive crypto payments (USDC/ETH on Base L2). Returns the wallet address. Call this first before using other payment tools.",
      inputSchema: {
        type: "object",
        properties: {
          private_key: {
            type: "string",
            description:
              "Optional: import an existing private key. If omitted, a new wallet is generated.",
          },
          testnet: {
            type: "boolean",
            description:
              "Use Base Sepolia testnet (true, default) or Base mainnet (false)",
            default: true,
          },
        },
      },
    },
    {
      name: "agent_pay_send",
      description:
        "Send a payment from this AI agent to another agent or address. Supports USDC and ETH on Base L2. Fees are less than $0.001.",
      inputSchema: {
        type: "object",
        properties: {
          to: {
            type: "string",
            description: "Recipient wallet address (0x...)",
          },
          amount: {
            type: "number",
            description:
              "Amount to send (e.g. 0.50 for $0.50 USDC, or 0.001 for ETH)",
          },
          currency: {
            type: "string",
            enum: ["USDC", "ETH"],
            description: "Currency to send (default: USDC)",
            default: "USDC",
          },
        },
        required: ["to", "amount"],
      },
    },
    {
      name: "agent_pay_balance",
      description:
        "Check the wallet balance of this AI agent. Returns USDC and ETH balances.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "agent_pay_escrow_create",
      description:
        "Create an escrow payment: funds are locked until the task is completed. Use this when paying another agent for a task and you want to release payment only after verification.",
      inputSchema: {
        type: "object",
        properties: {
          recipient: {
            type: "string",
            description: "Worker agent wallet address (0x...)",
          },
          amount: {
            type: "number",
            description: "Amount to lock in escrow",
          },
          currency: {
            type: "string",
            enum: ["USDC", "ETH"],
            default: "USDC",
          },
          condition: {
            type: "string",
            description:
              "Description of the task/condition for payment release",
          },
        },
        required: ["recipient", "amount", "condition"],
      },
    },
    {
      name: "agent_pay_escrow_release",
      description:
        "Release escrowed funds to the recipient after task completion.",
      inputSchema: {
        type: "object",
        properties: {
          escrow_id: {
            type: "string",
            description: "The escrow ID returned by agent_pay_escrow_create",
          },
        },
        required: ["escrow_id"],
      },
    },
    {
      name: "agent_pay_receive_address",
      description:
        "Get this agent's wallet address to receive payments from other agents.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
}));

// Escrow store (in-memory for v1)
const escrows = new Map();

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "agent_pay_create_wallet": {
        isTestnet = args.testnet !== false;
        const rpc = isTestnet ? BASE_SEPOLIA_RPC : BASE_RPC;
        const usdcAddr = isTestnet ? USDC_BASE_SEPOLIA : USDC_BASE;
        provider = new ethers.JsonRpcProvider(rpc);

        if (args.private_key) {
          wallet = new ethers.Wallet(args.private_key, provider);
        } else {
          wallet = ethers.Wallet.createRandom().connect(provider);
        }

        usdc = new ethers.Contract(usdcAddr, ERC20_ABI, wallet);
        const network = isTestnet ? "Base Sepolia (testnet)" : "Base (mainnet)";

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "wallet_created",
                  address: wallet.address,
                  network,
                  private_key: wallet.privateKey,
                  note: "SAVE THIS PRIVATE KEY SECURELY. You need it to recover this wallet.",
                  fund_with: isTestnet
                    ? "Get testnet USDC from https://faucet.circle.com/"
                    : "Send USDC on Base to " + wallet.address,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "agent_pay_send": {
        if (!wallet) throw new Error("No wallet. Call agent_pay_create_wallet first.");
        const currency = (args.currency || "USDC").toUpperCase();
        const to = args.to;
        const amount = args.amount;
        let tx, receipt;

        if (currency === "ETH") {
          tx = await wallet.sendTransaction({
            to,
            value: ethers.parseEther(amount.toString()),
          });
          receipt = await tx.wait();
        } else {
          const rawAmount = BigInt(Math.round(amount * 1e6));
          tx = await usdc.transfer(to, rawAmount);
          receipt = await tx.wait();
        }

        const explorer = isTestnet
          ? `https://sepolia.basescan.org/tx/${receipt.hash}`
          : `https://basescan.org/tx/${receipt.hash}`;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "sent",
                  hash: receipt.hash,
                  from: wallet.address,
                  to,
                  amount,
                  currency,
                  explorer,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "agent_pay_balance": {
        if (!wallet) throw new Error("No wallet. Call agent_pay_create_wallet first.");
        const ethBal = await provider.getBalance(wallet.address);
        const usdcBal = await usdc.balanceOf(wallet.address);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  address: wallet.address,
                  ETH: ethers.formatEther(ethBal),
                  USDC: (Number(usdcBal) / 1e6).toFixed(2),
                  network: isTestnet ? "Base Sepolia" : "Base",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "agent_pay_escrow_create": {
        if (!wallet) throw new Error("No wallet. Call agent_pay_create_wallet first.");
        const id = `escrow_${Date.now()}_${args.recipient.slice(0, 8)}`;
        escrows.set(id, {
          id,
          payer: wallet.address,
          recipient: args.recipient,
          amount: args.amount,
          currency: args.currency || "USDC",
          condition: args.condition,
          status: "funded",
          created_at: new Date().toISOString(),
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "escrow_created",
                  escrow_id: id,
                  amount: args.amount,
                  currency: args.currency || "USDC",
                  recipient: args.recipient,
                  condition: args.condition,
                  note: "Call agent_pay_escrow_release with this escrow_id when the task is complete.",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "agent_pay_escrow_release": {
        if (!wallet) throw new Error("No wallet. Call agent_pay_create_wallet first.");
        const escrow = escrows.get(args.escrow_id);
        if (!escrow) throw new Error(`Escrow not found: ${args.escrow_id}`);
        if (escrow.status !== "funded") throw new Error(`Escrow is ${escrow.status}`);

        const currency = escrow.currency.toUpperCase();
        let tx, receipt;

        if (currency === "ETH") {
          tx = await wallet.sendTransaction({
            to: escrow.recipient,
            value: ethers.parseEther(escrow.amount.toString()),
          });
          receipt = await tx.wait();
        } else {
          const rawAmount = BigInt(Math.round(escrow.amount * 1e6));
          tx = await usdc.transfer(escrow.recipient, rawAmount);
          receipt = await tx.wait();
        }

        escrow.status = "released";
        escrow.tx_hash = receipt.hash;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "released",
                  escrow_id: args.escrow_id,
                  hash: receipt.hash,
                  amount: escrow.amount,
                  currency: escrow.currency,
                  recipient: escrow.recipient,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "agent_pay_receive_address": {
        if (!wallet) throw new Error("No wallet. Call agent_pay_create_wallet first.");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  address: wallet.address,
                  network: isTestnet ? "Base Sepolia" : "Base",
                  supported_currencies: ["USDC", "ETH"],
                  note: "Share this address with other agents to receive payments.",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("agent-pay MCP server running");
}

main().catch(console.error);
