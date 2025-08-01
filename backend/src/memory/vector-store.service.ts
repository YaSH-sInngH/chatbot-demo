import {Injectable, OnModuleInit} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class VectorStoreService implements OnModuleInit {
    private readonly baseURL = process.env.CHROMA_BASE_URL;
    private readonly collectionName = 'memory';

    async onModuleInit() {
        try {
            // Check if collection exists
            await axios.get(`${this.baseURL}/v2/collections/${this.collectionName}`);
        } catch (err) {
            if (err.response?.status === 404) {
            // Create collection if it doesn't exist
            await axios.post(`${this.baseURL}/v2/collections`, {
                name: this.collectionName,
                metadata: { description: 'Chat memory collection' }
            });
            } else {
            throw new Error(`ChromaDB connection failed: ${err.message}`);
            }
        }
    }

    async addDocument(id: string, embedding: number[], metadata: any, content: string) {
        await axios.post(`${this.baseURL}/v2/collections/${this.collectionName}/upsert`, {
            ids: [id],
            embeddings: [embedding],
            documents: [content],
            metadatas: [metadata], 
        });
    }

    async querySimilar(embedding: number[], topK = 5): Promise<string[]> {
        const res = await axios.post(`${this.baseURL}/v2/collections/${this.collectionName}/query`, {
            query_embeddings: [embedding],
            n_results: topK,
        });
        // API returns shape { documents: [[...]] }
        return (res.data?.documents?.[0] as string[]) || [];
    }
}