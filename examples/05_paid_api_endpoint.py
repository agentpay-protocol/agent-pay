"""Example 5: AI agent that charges for its API.

A FastAPI service where callers pay USDC per request.
This is the 'agent economy' in action.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from agent_pay import AgentPay

app = FastAPI(title="Paid AI Translation Agent")

# This agent's wallet — it receives payments
agent = AgentPay(testnet=True)
PRICE_PER_REQUEST = 0.01  # $0.01 USDC per translation

print(f"Agent wallet: {agent.address}")
print(f"Price: {PRICE_PER_REQUEST} USDC per request")


class TranslationRequest(BaseModel):
    text: str
    target_language: str
    payment_tx_hash: str  # Proof that caller already paid


@app.get("/info")
def info():
    """Returns agent info and payment address."""
    return {
        "service": "AI Translation",
        "price": PRICE_PER_REQUEST,
        "currency": "USDC",
        "pay_to": agent.address,
        "network": "Base L2",
    }


@app.post("/translate")
async def translate(req: TranslationRequest):
    """Translate text. Requires payment proof."""
    # In production: verify the tx_hash on-chain
    # For demo: just check it's not empty
    if not req.payment_tx_hash:
        raise HTTPException(402, "Payment required. Send USDC to " + agent.address)

    # Do the translation (placeholder)
    result = f"[Translated to {req.target_language}]: {req.text}"

    return {
        "translation": result,
        "payment_verified": True,
        "balance": agent.balance("USDC"),
    }


# Run: uvicorn examples.05_paid_api_endpoint:app --reload
