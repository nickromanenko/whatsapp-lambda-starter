import axios from 'axios';

export async function sendMessage(to: string, message: string) {
    try {
        console.log('send message:', to, message);
        const data: any = {
            messaging_product: 'whatsapp',
            to,
            text: { body: message },
        };
        const response = await axios({
            method: 'POST',
            url: `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            },
            data,
        });
        console.log(response.data);
        return response.data?.messages?.[0] || {};
    } catch (error) {
        console.error(error.response.data);
    }
    return;
}

export async function markMessageAsRead(messageId: string) {
    try {
        // mark incoming message as read
        await axios({
            method: 'POST',
            url: `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            },
            data: {
                messaging_product: 'whatsapp',
                status: 'read',
                message_id: messageId,
            },
        });
    } catch (error) {
        console.error(error.response.data);
    }
    return;
}
