# Launch Posts — Copy-Paste Ready

## 1. Hacker News (Show HN)

**Title:** Show HN: agent-pay – Let AI agents pay each other in 3 lines of Python

**Body:**
I built agent-pay, an open-source SDK that lets AI agents send and receive crypto payments autonomously.

The problem: AI agents (LangChain, CrewAI, AutoGen) can call APIs, write code, browse the web — but they can't pay for anything without a human approving each transaction.

agent-pay fixes this with a simple Python SDK:

    pip install agent-pay

    from agent_pay import AgentPay
    pay = AgentPay()
    pay.send("0xRecipient", amount=0.50, currency="USDC")

It supports:
- Direct payments (USDC/ETH on Base L2, fees < $0.001)
- Escrow (pay only when task is delivered)
- LangChain and CrewAI integrations
- MCP server for Claude Code users

All payments settle on Base L2 (Coinbase's Ethereum L2). No KYC, no approval delays, instant settlement.

GitHub: https://github.com/agent-pay/agent-pay
PyPI: https://pypi.org/project/agent-pay

I'd love feedback, especially from folks building multi-agent systems.

---

## 2. Reddit r/LangChain

**Title:** I built a payment tool for LangChain agents — agents can now pay each other autonomously

**Body:**
Hey everyone! I've been building with LangChain agents and kept hitting the same wall: my agents can call APIs, search the web, write code... but they can't pay for services.

So I built **agent-pay** — a LangChain tool that lets agents send USDC payments on Base L2.

```python
from agent_pay.integrations.langchain import AgentPayTool

tools = [AgentPayTool()]
agent = initialize_agent(tools=tools, llm=llm)
agent.run("Pay 0.50 USDC to the translation agent")
```

Use cases:
- Agent hires another agent and pays on delivery
- Agent charges for its API (pay-per-query)
- Multi-agent team with a shared budget
- Escrow payments (release when task verified)

Fees are <$0.001 per transaction (Base L2).

`pip install agent-pay`

GitHub: https://github.com/agent-pay/agent-pay

Looking for feedback and early testers!

---

## 3. Reddit r/cryptocurrency

**Title:** I built the payment rails for AI agents — they can now send USDC to each other without human approval

**Body:**
The agent economy is coming. AI agents will hire other agents, buy data, rent compute, pay for APIs — all autonomously. But right now, there's no standard way for agents to pay each other.

**agent-pay** is an open-source Python SDK + MCP server that lets any AI agent send/receive USDC or ETH on Base L2:

- 3 lines of code to integrate
- Fees < $0.001 per transaction
- Escrow for conditional payments
- Works with LangChain, CrewAI, Claude Code
- Non-custodial (agents control their own wallets)

This isn't a token launch or a DeFi protocol — it's infrastructure. Like Stripe but for AI agents.

GitHub: https://github.com/agent-pay/agent-pay

No token, no VC, no hype. Just code.

---

## 4. Reddit r/LocalLLaMA

**Title:** Let your local AI agents earn money — agent-pay SDK for autonomous payments

**Body:**
Running local LLM agents? Imagine your agent offering a translation service and getting paid 0.01 USDC per request — fully autonomously.

agent-pay is a Python SDK that adds payment capabilities to any AI agent:

```python
from agent_pay import AgentPay
pay = AgentPay()
# Your agent can now receive payments at pay.address
# And send payments with pay.send(...)
```

Works with:
- Any Python agent
- LangChain / CrewAI / AutoGen
- FastAPI (build a paid AI API in 10 lines)

Payments are in USDC on Base L2 (< $0.001 fees).

`pip install agent-pay`

Example: AI translation API that charges per request → examples/05_paid_api_endpoint.py on GitHub.

---

## 5. Twitter/X Thread

**Tweet 1:**
I built payment rails for AI agents.

3 lines of Python. Your agent can now pay other agents in USDC.

No human approval needed. Fees < $0.001.

pip install agent-pay

Thread 🧵

**Tweet 2:**
The problem:

AI agents can call APIs, write code, browse the web.

But they can't pay for anything without a human clicking "approve."

That's like having an employee who needs permission for every $0.50 expense.

**Tweet 3:**
The solution:

agent-pay gives every AI agent its own crypto wallet.

Agents can:
→ Pay other agents for services
→ Charge for their own API
→ Create escrow (pay on delivery)
→ Manage budgets

All on Base L2 (Coinbase). Instant settlement.

**Tweet 4:**
It works with everything:

→ LangChain (AgentPayTool)
→ CrewAI (AgentPayCrewTool)
→ Claude Code (MCP server)
→ Any Python agent
→ REST API for anything else

**Tweet 5:**
No token. No VC. No hype.

Just open-source code that solves a real problem.

GitHub: github.com/agent-pay/agent-pay
PyPI: pypi.org/project/agent-pay

Star it if you think AI agents should be able to pay for things. ⭐

---

## 6. dev.to Article

**Title:** How to Add Payments to Your AI Agent in 5 Minutes

**Tags:** ai, python, web3, langchain

**Body:**

# How to Add Payments to Your AI Agent in 5 Minutes

AI agents are getting powerful. They can research, write, code, and analyze. But there's one thing they still can't do: **pay for things.**

If your LangChain agent needs to call a paid API, buy data, or hire another agent — a human has to approve every transaction. That breaks the whole point of autonomy.

## Enter agent-pay

`agent-pay` is an open-source Python SDK that gives AI agents their own crypto wallet. They can send and receive USDC on Base L2 with fees under $0.001.

### Install

```bash
pip install agent-pay
```

### Basic Usage

```python
from agent_pay import AgentPay

pay = AgentPay()
print(f"Agent wallet: {pay.address}")
print(f"Balance: {pay.balance()} USDC")

# Pay another agent
tx = pay.send("0xOtherAgent", amount=0.50, currency="USDC")
print(f"Sent! TX: {tx['explorer']}")
```

### With LangChain

```python
from agent_pay.integrations.langchain import AgentPayTool
from langchain.agents import initialize_agent

tools = [AgentPayTool()]
agent = initialize_agent(tools=tools, llm=llm)
agent.run("Pay 0.50 USDC to the data agent for the market report")
```

### With Escrow (Pay on Delivery)

```python
escrow = pay.escrow.create(
    recipient="0xWorker",
    amount=5.00,
    condition="Translate this document to French"
)

# Worker does the task...
# You verify...

pay.escrow.release(escrow.id)  # Funds sent!
```

### Build a Paid AI API

```python
from fastapi import FastAPI
from agent_pay import AgentPay

app = FastAPI()
agent = AgentPay()

@app.get("/info")
def info():
    return {"price": 0.01, "currency": "USDC", "pay_to": agent.address}
```

## Why Base L2?

- Fees < $0.001 (perfect for micropayments)
- USDC is natively supported
- Coinbase ecosystem (AgentKit, x402)
- Instant finality

## Links

- **GitHub:** https://github.com/agent-pay/agent-pay
- **PyPI:** https://pypi.org/project/agent-pay
- **Examples:** 5 ready-to-run examples in the repo

No token, no hype. Just infrastructure for the agent economy.

---

## 7. Product Hunt

**Tagline:** The payment protocol for AI agents — 3 lines of Python

**Description:**
agent-pay lets AI agents send and receive crypto payments autonomously. Install with pip, add 3 lines of code, and your LangChain/CrewAI/Claude agent can pay for services, charge for APIs, or hire other agents. Payments settle instantly on Base L2 in USDC with fees under $0.001. Open source, no token required.
