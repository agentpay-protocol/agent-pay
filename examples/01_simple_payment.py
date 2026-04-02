"""Example 1: Simple payment between two agents.

Agent A pays Agent B 0.50 USDC for a translation task.
This is the simplest possible use case.
"""

from agent_pay import AgentPay

# Agent A — the one who pays
agent_a = AgentPay(testnet=True)
print(f"Agent A wallet: {agent_a.address}")
print(f"Agent A balance: {agent_a.balance('USDC')} USDC")

# Agent B — the one who gets paid
agent_b = AgentPay(testnet=True)
print(f"Agent B wallet: {agent_b.address}")

# Agent A pays Agent B
tx = agent_a.send(
    to=agent_b.address,
    amount=0.50,
    currency="USDC",
    memo="Payment for EN->FR translation"
)
print(f"Payment sent! TX: {tx['explorer']}")
