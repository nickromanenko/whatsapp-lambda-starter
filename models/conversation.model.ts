import * as dynamoose from 'dynamoose';
import { v4 as uuidv4 } from 'uuid';
import { createThread } from '../services/openai.service';
export interface Conversation {
    id: string;
    phone: string;
    thread_id: string;
    created_at: string;
}

export const ConversationSchema = dynamoose.model('bot_threads', {
    id: {
        type: String,
        hashKey: true,
    },
    phone: {
        type: String,
    },
    thread_id: {
        type: String,
    },
    created_at: {
        type: String,
    },
});

export async function getConversation(phone: string) {
    const conversation = (await ConversationSchema.scan('phone').eq(phone).exec()).toJSON();
    if (conversation.length === 0) {
        const threadId = await createThread();
        const conversation = await createConversation(phone, threadId);
        return conversation;
    }

    return conversation[0];
}

export async function createConversation(phone: string, threadId: string) {
    const conversation = new ConversationSchema({
        id: uuidv4(),
        phone,
        thread_id: threadId,
        created_at: new Date().toISOString(),
    });
    await conversation.save();
    return conversation;
}
