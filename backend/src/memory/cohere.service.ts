import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CohereService {
    private readonly API_KEY = process.env.COHERE_API_KEY;
    /* Cohere REST endpoints */
    private readonly EMBED_ENDPOINT = 'https://api.cohere.ai/v1/embed';
    private readonly GENERATE_ENDPOINT = 'https://api.cohere.ai/v1/chat';

    async getEmbedding(text: string): Promise<number[]> {
        try {
            if (!text) throw new Error('Text cannot be empty');

            const response = await axios.post(
                this.EMBED_ENDPOINT,
                {
                    texts: [text],
                    model: 'embed-english-v3.0',
                    input_type: text.includes('?') ? 'search_query' : 'search_document',
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000
                }
            );

            if (!response.data?.embeddings?.[0]) {
                throw new Error('Invalid embedding response from Cohere');
            }

            return response.data.embeddings[0];
        } catch (error) {
            console.error('Embedding generation failed:', error.message);
            throw new Error(`Failed to generate embedding: ${error.message}`);
        }
    }

    async generateText(prompt: string): Promise<string> {
        try {
            const response = await axios.post(
                this.GENERATE_ENDPOINT,
                {
                    message: prompt,
                    model: 'command-xlarge-nightly',
                    max_tokens: 300,
                    // Add any additional parameters you need
                    temperature: 0.7,
                    preamble: "You are a helpful AI assistant",
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.API_KEY}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            return response.data.text || response.data.message;
        } catch (error) {
            console.error('Cohere API Error:', error.response?.data || error.message);
            throw new Error('Failed to generate response from Cohere');
        }
    }
}