from app.memory.long_memory import retrieve_memory
from app.memory.long_memory import save_memory

def remember(text: str):

    save_memory(text)

    return "Memory saved"

def recall(query: str):

    memories = retrieve_memory(query)

    return "\n".join(memories)