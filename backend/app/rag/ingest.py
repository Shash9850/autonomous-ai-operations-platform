from app.rag.loader import load_pdf
from app.rag.splitter import split_documents
from app.rag.embedder import get_embeddings

from langchain_community.vectorstores import FAISS

import os


VECTOR_DB_PATH = "storage/vectorstore"


def ingest_document(file_path: str):

    docs = load_pdf(file_path)

    chunks = split_documents(docs)
    for chunk in chunks:

        chunk.metadata["source"] = os.path.basename(file_path)

    embeddings = get_embeddings()

    faiss_index_path = os.path.join(
        VECTOR_DB_PATH,
        "index.faiss"
    )

    if os.path.exists(faiss_index_path):

        db = FAISS.load_local(
            VECTOR_DB_PATH,
            embeddings,
            allow_dangerous_deserialization=True
        )

        db.add_documents(chunks)

    else:

        db = FAISS.from_documents(
            chunks,
            embeddings
        )

    db.save_local(VECTOR_DB_PATH)

    return "Document ingested successfully"