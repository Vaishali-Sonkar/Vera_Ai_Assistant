import faiss
import numpy as np
import pickle
from pathlib import Path


class VectorStore:

    def __init__(self, dimension=None):
        if dimension:
            self.index = faiss.IndexFlatL2(dimension)
        else:
            self.index = None

        self.chunks = []

    def add(self, embeddings, chunks):

        vectors = np.array(
            embeddings,
            dtype="float32"
        )

        self.index.add(vectors)
        self.chunks.extend(chunks)

    def search(self, query_embedding, k=3):

        query_vector = np.array(
            [query_embedding],
            dtype="float32"
        )

        distances, indices = self.index.search(
            query_vector,
            k
        )

        results = []

        for index in indices[0]:
            if index != -1:
                results.append(self.chunks[index])

        return results

    def save(self, index_path, chunks_path):

        Path(index_path).parent.mkdir(parents=True, exist_ok=True)
        Path(chunks_path).parent.mkdir(parents=True, exist_ok=True)

        faiss.write_index(
            self.index,
            index_path
        )

        with open(chunks_path, "wb") as f:
            pickle.dump(self.chunks, f)

    @classmethod
    def load(cls, index_path, chunks_path):

        store = cls()

        store.index = faiss.read_index(
            index_path
        )

        with open(chunks_path, "rb") as f:
            store.chunks = pickle.load(f)

        return store