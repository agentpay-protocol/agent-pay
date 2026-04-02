"""Tests for the AgentPay client."""

import pytest
from unittest.mock import patch, MagicMock
from src.sdk.client import AgentPay
from src.sdk.config import AgentPayConfig


def test_client_creates_wallet():
    """AgentPay() should auto-generate a wallet."""
    pay = AgentPay(testnet=True)
    assert pay.address is not None
    assert pay.address.startswith("0x")
    assert len(pay.address) == 42


def test_client_imports_key():
    """AgentPay(private_key=...) should import existing wallet."""
    # Known test key (never use on mainnet)
    key = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    pay = AgentPay(private_key=key, testnet=True)
    assert pay.address == "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"


def test_client_spending_limit():
    """Should reject payments above spending limit."""
    pay = AgentPay(testnet=True, spending_limit_usd=10.0)
    with pytest.raises(ValueError, match="exceeds daily spending limit"):
        pay.send("0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18", amount=50.0)


def test_client_rejects_zero_amount():
    """Should reject zero or negative amounts."""
    pay = AgentPay(testnet=True)
    with pytest.raises(ValueError, match="must be positive"):
        pay.send("0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18", amount=0)
    with pytest.raises(ValueError, match="must be positive"):
        pay.send("0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18", amount=-1)


def test_config_testnet():
    """Testnet config should use Base Sepolia."""
    config = AgentPayConfig(testnet=True)
    assert config.chain.chain_id == 84532
    assert "sepolia" in config.chain.rpc_url


def test_config_mainnet():
    """Mainnet config should use Base."""
    config = AgentPayConfig(testnet=False)
    assert config.chain.chain_id == 8453
    assert "mainnet" in config.chain.rpc_url


def test_escrow_create():
    """Should create an escrow record."""
    pay = AgentPay(testnet=True)
    # Mock balance to avoid RPC call
    pay.wallet.balance = MagicMock(return_value=100.0)
    escrow = pay.escrow.create(
        recipient="0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
        amount=5.0,
        currency="USDC",
        condition="Translate a document",
    )
    assert escrow.id.startswith("escrow_")
    assert escrow.amount == 5.0
    assert escrow.status.value == "funded"


def test_escrow_insufficient_balance():
    """Should reject escrow if balance too low."""
    pay = AgentPay(testnet=True)
    pay.wallet.balance = MagicMock(return_value=1.0)
    with pytest.raises(ValueError, match="Insufficient"):
        pay.escrow.create(
            recipient="0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
            amount=5.0,
        )
