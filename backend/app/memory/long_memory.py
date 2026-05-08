from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

from app.rag.embedder import get_embeddings

embedding_model = get_embeddings()

memory_store = FAISS.from_documents(
    [Document(page_content="Initial memory")],
    embedding_model
)

def save_memory(text):

    global memory_store

    memory_store.add_documents([
        Document(page_content=text)
    ])

def retrieve_memory(query):

    docs = memory_store.similarity_search(query, k=3)

    return [doc.page_content for doc in docs]