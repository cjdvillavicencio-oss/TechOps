import OpenAI from 'openai';

const DEFAULT_MODEL = 'gpt-4.1-mini';

let cachedClient = null;

export function getServerOpenAIClient() {
  if (cachedClient) return cachedClient;
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY_MISSING');
  }

  cachedClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return cachedClient;
}

export function buildAgentInstructions(agent) {
  const instructions = [
    `Tu nombre es ${agent.name}.`,
    `Tu rol visible para la persona es: ${agent.role}.`,
    'Responde siempre en espanol claro y util.',
  ];

  if (agent.systemPrompt?.trim()) {
    instructions.push(`Prompt configurado:\n${agent.systemPrompt.trim()}`);
  }

  if (agent.behaviorFileContent?.trim()) {
    instructions.push(`Comportamiento cargado desde archivo:\n${agent.behaviorFileContent.trim()}`);
  }

  if (agent.knowledgeFileContent?.trim()) {
    instructions.push(`Base de conocimiento local:\n${agent.knowledgeFileContent.trim()}`);
  }

  return instructions.join('\n\n');
}

export async function generateAgentReply({ agent, conversation, userMessage }) {
  const client = getServerOpenAIClient();
  const model = agent.model?.trim() || DEFAULT_MODEL;
  const recentMessages = Array.isArray(conversation) ? conversation.slice(-10) : [];
  const messages = [
    {
      role: 'system',
      content: buildAgentInstructions(agent),
    },
    ...recentMessages.map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content,
    })),
    {
      role: 'user',
      content: userMessage,
    },
  ];

  const completion = await client.chat.completions.create({
    model,
    messages,
  });

  const content = completion.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error('OPENAI_EMPTY_RESPONSE');
  }

  return {
    content,
    model,
  };
}
