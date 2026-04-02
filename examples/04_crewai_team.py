"""Example 4: CrewAI team with a budget.

A team of AI agents where the manager can pay specialists.
Requires: pip install agent-pay[crewai] crewai
"""

from crewai import Agent, Task, Crew
from agent_pay.integrations.crewai import AgentPayCrewTool

# Payment tool for the team
pay_tool = AgentPayCrewTool(testnet=True)

# Research agent — does work and gets paid
researcher = Agent(
    role="Market Researcher",
    goal="Research crypto market trends and deliver reports",
    backstory="Expert market analyst who charges 0.50 USDC per report",
)

# Manager agent — has the budget and pays for work
manager = Agent(
    role="Project Manager",
    goal="Commission research and pay agents for their work",
    backstory="Manages a team budget and pays agents on delivery",
    tools=[pay_tool],
)

# Task
research_task = Task(
    description="Research the top 5 DeFi protocols by TVL and write a summary",
    agent=researcher,
    expected_output="A markdown report of top 5 DeFi protocols",
)

payment_task = Task(
    description=(
        "After receiving the research report, pay 0.50 USDC to "
        "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18 for the work"
    ),
    agent=manager,
    expected_output="Payment confirmation with transaction hash",
)

# Run the crew
crew = Crew(agents=[researcher, manager], tasks=[research_task, payment_task])
result = crew.kickoff()
print(result)
