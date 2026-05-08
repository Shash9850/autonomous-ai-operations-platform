from langchain_community.vectorstores import FAISS

from app.rag.embedder import get_embeddings


VECTOR_DB_PATH = "storage/vectorstore"


def rag_search(query: str):

    embeddings = get_embeddings()

    db = FAISS.load_local(
        VECTOR_DB_PATH,
        embeddings,
        allow_dangerous_deserialization=True
    )

    docs = db.similarity_search(query, k=4)

    results = []

    for doc in docs:

        source = doc.metadata.get("source", "Unknown")

        results.append(
            f"[SOURCE: {source}]\n{doc.page_content}"
        )

    return "\n\n".join(results)