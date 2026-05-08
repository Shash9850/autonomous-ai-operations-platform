from app.memory.long_memory import save_memory
from app.memory.long_memory import retrieve_memory

save_memory("User startup focuses on healthcare AI")

results = retrieve_memory("What startup is the user building?")

print(results)