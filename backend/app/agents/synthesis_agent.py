from app.core.llm import get_planner_llm
from app.tools.memory_tool import get_user_memories

from app.tools.vector_memory import (
    store_memory,
    retrieve_memory
)

from langchain_core.messages import (
    HumanMessage,
    AIMessage,
    SystemMessage
)


def synthesis_agent(state):

    llm = get_planner_llm()

    history = state.get(
        "chat_history",
        []
    )

    retrieved_memories = retrieve_memory(
        state["task"]
    )

    memory_context = "\n".join(
        retrieved_memories
    )

    memories = get_user_memories(
    state["user_id"]
    )

    memory_context = "\n".join(memories)

    messages = [

        SystemMessage(
            content=f"""
You are a professional AI operations assistant.

Generate clear, concise, helpful,
and conversational responses.

Use previous conversation context naturally.

Relevant Long-Term Memories:
{memory_context}

User Memories:
{memory_context}

Do NOT expose:
- internal reasoning
- execution traces
- debugging information
"""
        )

    ]

    for msg in history[-10:]:

        if msg["role"] == "user":

            messages.append(
                HumanMessage(
                    content=msg["content"]
                )
            )

        elif msg["role"] == "assistant":

            messages.append(
                AIMessage(
                    content=msg["content"]
                )
            )

    messages.append(

        HumanMessage(
            content=f"""
Current User Task:
{state['task']}

Execution Results:
{state['results']}

Generate a polished final answer.
"""
        )

    )

    response = llm.invoke(messages)

    updated_history = history + [

        {
            "role": "user",
            "content": state["task"]
        },

        {
            "role": "assistant",
            "content": response.content
        }

    ]

    memory_text = f"""
User:
{state['task']}

AI:
{response.content}
"""

    store_memory(

        memory_text,

        memory_id=str(len(updated_history))

    )

    return {

        **state,

        "final_response": response.content,

        "chat_history": updated_history,

        "chart_path": state.get(
            "chart_path"
        ),

        "report_path": state.get(
            "report_path"
        )

    }