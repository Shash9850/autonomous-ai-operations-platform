import chromadb

from sentence_transformers import (
    SentenceTransformer
)

client = chromadb.Client()

collection = client.get_or_create_collection(
    name="memory"
)

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


def store_memory(text, memory_id):

    embedding = embedding_model.encode(text).tolist()

    collection.add(

        ids=[str(memory_id)],

        embeddings=[embedding],

        documents=[text]

    )


def retrieve_memory(query, top_k=5):

    embedding = embedding_model.encode(query).tolist()

    results = collection.query(

        query_embeddings=[embedding],

        n_results=top_k

    )

    return results["documents"][0]