"""Example 2: LangChain agent with payment capabilities.

A LangChain agent that can pay for services autonomously.
Requires: pip install agent-pay[langchain] langchain-openai
"""

from langchain_openai import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
from agent_pay.integrations.langchain import AgentPayTool, BalanceTool

# Create payment tools
pay_tool = AgentPayTool(testnet=True)
balance_tool = BalanceTool(testnet=True)

print(f"Agent wallet: {pay_tool.pay_client.address}")
print("Fund this wallet with testnet USDC from https://faucet.circle.com/")

# Create the LangChain agent
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
agent = initialize_agent(
    tools=[pay_tool, balance_tool],
    llm=llm,
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True,
)

# The agent can now pay autonomously
agent.run(
    "Check my balance, then send 0.10 USDC to "
    "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18 "
    "as payment for a data analysis task."
)
