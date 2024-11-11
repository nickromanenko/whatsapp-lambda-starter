import { getConversation } from 'models/conversation.model';
import { addMessageToThread } from './openai.service';
import { markMessageAsRead, sendMessage } from './whatsapp.service';

export async function onBotMessageReceived(message: any) {
    console.log('[!] Bot message received:', message.id);
    try {
        await markMessageAsRead(message.id);

        let answer = '';
        if (message.type == 'text') {
            answer = message.text.body;
        } else if (message.type == 'button') {
            answer = message.button.payload;
        }
        const phone = message.from;
        console.log(`Message from ${phone}:`, answer);

        const conversation = await getConversation(phone);
        const threadId = conversation.thread_id;

        // Add message to the thread
        const response = await addMessageToThread(threadId, answer);
        console.log('BOT RESPONSE:', response);

        // Send whatsapp message
        await sendMessage(phone, response);

        return;
    } catch (error) {
        console.error('===============================ERROR===============================');
        console.error(error.message || error);
    }

    return;
}

export async function onMessageStatusChanged(status: any) {
    console.log('STATUS:', status.status, 'RECIPIENT:', status.recipient_id, 'ID:', status.id, 'DEBUG:', JSON.stringify(status));
    return;
}
