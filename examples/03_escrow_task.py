"""Example 3: Escrow payment — pay only when task is done.

Agent A creates an escrow. Agent B does the work.
Agent A verifies, then releases payment.
"""

from agent_pay import AgentPay

# Setup
client_agent = AgentPay(testnet=True)
worker_agent = AgentPay(testnet=True)

print(f"Client: {client_agent.address}")
print(f"Worker: {worker_agent.address}")

# Client creates escrow
escrow = client_agent.escrow.create(
    recipient=worker_agent.address,
    amount=2.00,
    currency="USDC",
    condition="Summarize the top 10 HN posts today",
    timeout_seconds=3600,  # 1 hour to complete
)
print(f"Escrow created: {escrow.id}")
print(f"Amount locked: {escrow.amount} {escrow.currency}")
print(f"Condition: {escrow.condition}")

# ... Worker does the task ...
# ... Client verifies the result ...

# Client releases payment
tx = client_agent.escrow.release(escrow.id)
print(f"Payment released! TX: {tx['explorer']}")
