import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { appendMessagesToGoogleSheet } from '@/lib/server/google-sheets';
import { generateAgentReply } from '@/lib/server/openai';

function formatTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);

    const agent = body?.agent;
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const conversation = Array.isArray(body?.conversation) ? body.conversation : [];
    const conversationId =
      typeof body?.conversationId === 'string' && body.conversationId.trim()
        ? body.conversationId.trim()
        : `conv_${agent?.id || 'agent'}`;
    const creditsCharged = typeof body?.creditsCharged === 'number' ? body.creditsCharged : 0;
    const sheetId = typeof body?.sheetId === 'string' ? body.sheetId.trim() : '';
    const sheetTab = typeof body?.sheetTab === 'string' && body.sheetTab.trim() ? body.sheetTab.trim() : 'Historial';
    const userEmail =
      session?.user?.email ||
      (typeof body?.userEmail === 'string' && body.userEmail.trim() ? body.userEmail.trim() : 'anonimo');

    if (!agent?.id || !agent?.name || !message) {
      return NextResponse.json({ error: 'INVALID_CHAT_PAYLOAD' }, { status: 400 });
    }

    const aiResult = await generateAgentReply({
      agent,
      conversation,
      userMessage: message,
    });

    let sheetWarning = null;
    try {
      const timestamp = formatTimestamp(new Date());
      const rows = [
        [
          timestamp,
          agent.id,
          agent.name,
          conversationId,
          'user',
          message,
          aiResult.model,
          userEmail,
          '0',
        ],
        [
          formatTimestamp(new Date()),
          agent.id,
          agent.name,
          conversationId,
          'assistant',
          aiResult.content,
          aiResult.model,
          userEmail,
          String(creditsCharged),
        ],
      ];

      const sheetResult = await appendMessagesToGoogleSheet({
        sheetId,
        sheetTab,
        rows,
      });

      if (!sheetResult.ok && !sheetResult.skipped) {
        sheetWarning = 'No se pudo guardar el historial en Google Sheets.';
      }
    } catch (error) {
      console.warn('Google Sheets append failed:', error);
      sheetWarning = 'No se pudo guardar el historial en Google Sheets.';
    }

    return NextResponse.json({
      reply: aiResult.content,
      model: aiResult.model,
      sheetWarning,
      userEmail,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const status =
      error instanceof Error && error.message === 'OPENAI_API_KEY_MISSING' ? 500 : 500;
    const message =
      error instanceof Error && error.message === 'OPENAI_API_KEY_MISSING'
        ? 'Falta configurar OPENAI_API_KEY en el servidor.'
        : 'No se pudo generar la respuesta del agente.';

    return NextResponse.json({ error: message }, { status });
  }
}
