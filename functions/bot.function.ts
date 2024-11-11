import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { onBotMessageReceived, onMessageStatusChanged } from './../services/bot.service';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    try {
        const method = event.requestContext.http.method;
        switch (method) {
            case 'GET':
                console.log('💿 PAYLOAD:', JSON.stringify(event));
                const queryParams = event.queryStringParameters || {};
                const mode = queryParams['hub.mode'];
                const token = queryParams['hub.verify_token'];
                const challenge = queryParams['hub.challenge'];

                // check the mode and token sent are correct
                if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
                    console.log('Webhook verified successfully! 🎉');
                    return {
                        statusCode: 200,
                        body: challenge,
                    };
                } else {
                    return {
                        statusCode: 403,
                        body: '',
                    };
                }
            case 'POST':
                const body = JSON.parse(event.body || '{}');
                if (body.entry && body.entry[0] && body.entry[0].changes) {
                    const val = body.entry[0].changes[0].value;
                    if (val.statuses) {
                        for (const status of val.statuses) {
                            await onMessageStatusChanged(status);
                        }
                    }

                    if (val.messages) {
                        for (const message of val.messages) {
                            console.log('MESSAGE FROM:', message.from, 'ID:', message.id, 'MESSAGE:', JSON.stringify(message));
                            await onBotMessageReceived(message);
                        }
                    }
                    // console.log('[!] BODY:', JSON.stringify(body.entry[0].changes[0].value));
                } else {
                    console.log('[!] BODY:', JSON.stringify(body));
                }
                return {
                    statusCode: 200,
                    body: 'OK',
                };
            default:
                return {
                    statusCode: 200,
                    body: 'OK',
                };
        }
    } catch (error) {
        console.log('ERROR:', error);
        console.error(error);
        return {
            statusCode: 400,
            body: JSON.stringify(error.message || error),
        };
    }
};
