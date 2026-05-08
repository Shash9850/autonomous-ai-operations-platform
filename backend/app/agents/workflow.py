from langgraph.graph import StateGraph, END
from app.agents.direct_agent import direct_agent
from app.agents.state import AgentState
from app.agents.memory_agent import memory_agent

from app.agents.supervisor import supervisor_agent
from app.agents.planner import planner_agent
from app.agents.executor import executor_agent
from app.agents.rag_agent import rag_agent
from app.agents.synthesis_agent import synthesis_agent

def route_decision(state):

    if state["route"] == "rag":
        return "rag"

    elif state["route"] == "planner":
        return "planner"

    elif state["route"] == "direct":
        return "direct"
    
    elif state["route"] == "memory":
        return "memory"


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
    graph.add_node("synthesis", synthesis_agent)

    graph.set_entry_point("supervisor")

    graph.add_conditional_edges(
        "supervisor",
        route_decision
    )

    graph.add_edge("planner", "executor")

    graph.add_conditional_edges(
        "executor",
        should_continue
    )

    graph.add_edge("rag", "synthesis")
    graph.add_edge("direct", END)
    graph.add_edge("memory", END)
    graph.add_edge("synthesis", END)

    return graph.compile()