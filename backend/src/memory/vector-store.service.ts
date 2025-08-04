import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class VectorStoreService implements OnModuleInit {
    private collectionId: string;
    private readonly baseURL = process.env.CHROMA_BASE_URL || 'http://localhost:8000';
    private readonly collectionName = 'memory';
    private readonly tenant = 'default_tenant'; // Default tenant name
    private readonly database = 'default_database'; // Default database name
    private readonly logger = new Logger(VectorStoreService.name);

    private getCollectionPath() {
        if (!this.collectionId) {
            throw new Error('Collection ID not initialized');
        }
        return `/api/v2/tenants/${this.tenant}/databases/${this.database}/collections/${this.collectionId}`;
    }
    
    private getCollectionsBasePath() {
        return `/api/v2/tenants/${this.tenant}/databases/${this.database}/collections`;
    }

    async onModuleInit() {
        try {
            await this.waitForChromaDB();
            await this.ensureCollectionExists();
        } catch (error) {
            this.logger.error('Failed to initialize ChromaDB connection', error);
            throw error;
        }
    }

    private async waitForChromaDB(retries = 5, delay = 1000) {
        while (retries-- > 0) {
            try {
                await axios.get(`${this.baseURL}/api/v2/heartbeat`);
                this.logger.log('Connected to ChromaDB');
                return;
            } catch (err) {
                this.logger.warn(`ChromaDB not ready (${retries} retries left)`);
                await new Promise(res => setTimeout(res, delay));
            }
        }
        throw new Error("ChromaDB connection failed after retries");
    }

    private async ensureCollectionExists() {
        try {
            // First try to get the collection by name
            const collections = await axios.get(`${this.baseURL}${this.getCollectionsBasePath()}`);
            const existingCollection = collections.data.find((c: any) => c.name === this.collectionName);
            
            if (existingCollection) {
                this.collectionId = existingCollection.id;
                this.logger.log(`Collection ${this.collectionName} exists (ID: ${this.collectionId})`);
            } else {
                this.logger.log(`Creating collection ${this.collectionName}`);
                const response = await axios.post(`${this.baseURL}${this.getCollectionsBasePath()}`, {
                    name: this.collectionName,
                    metadata: { description: 'Chat memory collection' }
                });
                this.collectionId = response.data.id;
            }
        } catch (err) {
            throw new Error(`ChromaDB error: ${err.message}`);
        }
    }

    async addDocument(id: string, embedding: number[], metadata: any, content: string) {
        try {
            await axios.post(`${this.baseURL}${this.getCollectionPath()}/upsert`, {
                ids: [id],
                embeddings: [embedding],
                documents: [content],
                metadatas: [metadata],
            });
        } catch (error) {
            this.logger.error('Failed to add document', error);
            throw error;
        }
    }

    async querySimilar(embedding: number[], topK = 5, filters?:object): Promise<string[]> {
        try {
            const res = await axios.post(`${this.baseURL}${this.getCollectionPath()}/query`, {
                query_embeddings: [embedding],
                n_results: topK,
                where: filters
            });
            return (res.data?.documents?.[0] as string[]) || [];
        } catch (error) {
            this.logger.error('Failed to query similar documents', error);
            throw error;
        }
    }
}