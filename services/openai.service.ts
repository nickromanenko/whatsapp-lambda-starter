import OpenAI from 'openai';
import { MessageCreateParams } from 'openai/resources/beta/threads/messages';
import { retryOperation } from './utilities.service';

export async function createThread() {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const thread = await openai.beta.threads.create();
    return thread.id;
}

export async function addMessageToThread(threadId: string, content: string) {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const msg: MessageCreateParams = {
        role: 'user',
        content: content,
    };
    console.log('=====================================');
    console.log('MESSAGE:', msg);
    console.log('=====================================');
    console.log('Content length:', content.length);
    await openai.beta.threads.messages.create(threadId, msg);
    // Run operation
    await retryOperation(() => makeRun(openai, threadId, process.env.OPENAI_ASSISTANT_ID), 5000, 3);
    const messages = await openai.beta.threads.messages.list(threadId);
    // console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    // console.log('MESSAGES:', JSON.stringify(messages));
    const message: any = messages.data[0];
    if (message.role !== 'assistant') {
        throw new Error('No assistant response');
    }
    const messageContent: any = message.content[0];
    const responseText = messageContent.text.value
        .replace(/【.*?】/g, '')
        .replace(/\*\*/g, '*')
        .replace(/\[(.*?)\]\((.*?)\)/g, '$2');

    return responseText;
}

async function makeRun(openai: OpenAI, threadId: string, assistantId: string) {
    return new Promise(async (resolve, reject) => {
        const run = await openai.beta.threads.runs.createAndPoll(threadId, {
            assistant_id: assistantId,
        });
        console.log('Run:', JSON.stringify(run));
        console.log('------!------');
        console.log('USAGE:', run.usage);
        console.log('------!------');
        if (run.status !== 'completed') {
            console.log('[!!!] Run status:', run.status);
            console.log('[!!!] Run error:', run.last_error?.message);

            const errorMsg =
                run.last_error && run.last_error.code === 'rate_limit_exceeded'
                    ? 'Request too large. The input must be reduced in order to run successfully'
                    : run.last_error?.message || 'Error. Please try again later';

            return reject(new Error(errorMsg));
        }

        return resolve(run);
    });
}
