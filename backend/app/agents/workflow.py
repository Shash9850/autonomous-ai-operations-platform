
from langgraph.graph import StateGraph, END
from app.agents.direct_agent import direct_agent
from app.agents.state import AgentState
from app.agents.memory_agent import memory_agent
from app.agents.analytics_agent import analytics_agent

from app.agents.supervisor import supervisor_agent
from app.agents.planner import planner_agent
from app.agents.executor import executor_agent
from app.agents.rag_agent import rag_agent
from app.agents.synthesis_agent import synthesis_agent
from app.agents.search_agent import search_agent
from app.agents.web_search_agent import (
    web_search_agent
)

def route_decision(state):

    if state["route"] == "rag":
        return "rag"

    elif state["route"] == "planner":
        return "planner"

    elif state["route"] == "direct":
        return "direct"

    elif state["route"] == "memory":
        return "memory"

    elif state["route"] == "analytics":
        return "analytics"
    
    if state["route"] == "search":
        return "search"

def should_continue(state):

    if state["current_step"] >= len(state["plan"]):
        return "synthesis"

    return "executor"

def build_workflow():

    graph = StateGraph(AgentState)

    graph.add_node("supervisor", supervisor_agent)
    graph.add_node("planner", planner_agent)
    graph.add_node("executor", executor_agent)
    graph.add_node("rag", rag_agent)
    graph.add_node("direct", direct_agent)
    graph.add_node("memory", memory_agent)
    graph.add_node("analytics", analytics_agent)
    graph.add_edge("analytics", "synthesis")
    graph.add_node("synthesis", synthesis_agent)
    graph.add_node("web_search",web_search_agent)
    graph.add_node("search",search_agent)

    graph.set_entry_point("supervisor")

    graph.add_conditional_edges(
    "supervisor",
    route_decision,
    {
        "planner": "planner",
        "rag": "rag",
        "direct": "direct",
        "memory": "memory",
        "analytics": "analytics"
    }
)

    graph.add_edge("planner", "executor")

    graph.add_conditional_edges(
        "executor",
        should_continue
    )

    graph.add_edge("rag", "synthesis")
    graph.add_edge("direct", "synthesis")
    graph.add_edge("memory", "synthesis")
    graph.add_edge("analytics", "synthesis")
    graph.add_edge("synthesis", END)
    graph.add_edge("web_search","synthesis")
    graph.add_edge("search","synthesis")

    return graph.compile()