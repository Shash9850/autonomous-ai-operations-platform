from app.rag.loader import load_pdf
from app.rag.splitter import split_documents
from app.rag.vector_store import create_vector_store
from app.rag.retriever import retrieve_documents

documents = load_pdf("sample.pdf")

chunks = split_documents(documents)

vector_store = create_vector_store(chunks)

results = retrieve_documents(
    vector_store,
    "What is this document about?"
)

for doc in results:
    print(doc.page_content)
    print("=" * 50)