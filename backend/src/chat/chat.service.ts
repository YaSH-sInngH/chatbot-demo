import { Injectable } from '@nestjs/common';
import { CohereService } from '../memory/cohere.service';
import { VectorStoreService } from '../memory/vector-store.service';
import { UsersService } from '../users/users.service';
import { buildPrompt } from './utils/prompt.builder';

@Injectable()
export class ChatService {
    constructor(
        private readonly cohereService: CohereService,
        private readonly vectorStore: VectorStoreService,
        private readonly userService: UsersService,
    ) {}

    async chat(userId: string, message: string, conversationId?: string): Promise<string> {
        try {
            console.log('Request received:', { userId, message });

            // Define userPrompt from the input message
            const userPrompt = message;

            let currentConversationId = conversationId;
            if (!currentConversationId) {
                currentConversationId = `${userId}-${Date.now()}`;
            }

            // Get embedding for the user prompt
            const embedding = await Promise.race([
              this.cohereService.getEmbedding(message),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Embedding timeout')), 3000)
              )
            ]) as number[];

            // Query similar embeddings from the vector store
            const results = await this.vectorStore.querySimilar(embedding, 5, { userId })
              .catch((err) => {
                console.error('VectorStore querySimilar error:', err);
                return [] as string[];
              });

            // Fetch recent messages for the user
            const recentMessages = await this.userService.getRecentMessages(userId)
              .catch((err) => {
                console.error('UserService getRecentMessages error:', err);
                return [];
              });

            // Build the prompt using utility function
            const prompt = buildPrompt(recentMessages, results, userPrompt);

            // Call the LLM to generate a response
            const llmResponse = await this.callLLM(prompt)
              .catch((err) => {
                console.error('LLM response error:', err);
                return "I'm having trouble responding right now. Please try again later.";
              });

            // Prepare the document for storage
            const doc = `User: ${userPrompt}\nAssistant: ${llmResponse}`;
            await Promise.all([
            this.vectorStore.addDocument(
                `chat-${Date.now()}`,
                embedding, 
                { userId }, 
                `User: ${message}\nAssistant: ${llmResponse}`
            ),
            this.userService.saveChatHistory(userId, message, llmResponse, currentConversationId)
        ]);

            return llmResponse;
        } catch (error) {
            console.error('Detailed ChatService error:', {
            error: error.response?.data || error.message,
            stack: error.stack
        });
        throw new Error('Failed to process your message');
        }
    }

    private async callLLM(prompt: string): Promise<string> {
        // Ensure CohereService has a generateText method
        return this.cohereService.generateText(prompt);
    }
}
