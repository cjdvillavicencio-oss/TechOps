import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions, googleSheetsScope } from '@/lib/auth/options';
import { appendMessagesToGoogleSheet, chargeUserCredits } from '@/lib/server/google-sheets';
import { generateAgentReply } from '@/lib/server/openai';

function formatTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);
    const token = await getToken({ req: request, secret: authOptions.secret });

    const agent = body?.agent;
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const conversation = Array.isArray(body?.conversation) ? body.conversation : [];
    const conversationId =
      typeof body?.conversationId === 'string' && body.conversationId.trim()
        ? body.conversationId.trim()
        : `conv_${agent?.id || 'agent'}`;
    const creditsCharged = typeof body?.creditsCharged === 'number' ? body.creditsCharged : 0;
    const availableCredits = typeof body?.availableCredits === 'number' ? body.availableCredits : null;
    const sheetId = typeof body?.sheetId === 'string' ? body.sheetId.trim() : '';
    const sheetTab = typeof body?.sheetTab === 'string' && body.sheetTab.trim() ? body.sheetTab.trim() : 'Historial';
    const userEmail =
      session?.user?.email ||
      (typeof body?.userEmail === 'string' && body.userEmail.trim() ? body.userEmail.trim() : 'anonimo');

    if (!agent?.id || !agent?.name || !message) {
      return NextResponse.json({ error: 'INVALID_CHAT_PAYLOAD' }, { status: 400 });
    }

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'AUTH_REQUIRED', message: 'Necesitas iniciar sesion para usar creditos IA.' },
        { status: 401 },
      );
    }

    if (availableCredits !== null && availableCredits < creditsCharged) {
      return NextResponse.json(
        { error: 'INSUFFICIENT_CREDITS', message: 'No tienes creditos IA suficientes.' },
        { status: 402 },
      );
    }

    const tokenScopes = Array.isArray(token?.scopes) ? token.scopes : [];
    const hasSheetsScope = tokenScopes.includes(googleSheetsScope);
    let sheetWarning = null;
    let needsGoogleSheetsAuth = false;
    let resolvedSheetId = sheetId;
    let creditState = null;

    if (hasSheetsScope) {
      try {
        const charged = await chargeUserCredits({
          accessToken: token?.accessToken,
          refreshToken: token?.refreshToken,
          sheetId,
          sheetTab,
          userEmail,
          chargeUsd: creditsCharged,
          defaultCreditsUsd: 0.2,
        });

        if (charged.ok) {
          creditState = charged;
          resolvedSheetId = charged.spreadsheetId || resolvedSheetId;
        } else if (charged.insufficientCredits) {
          return NextResponse.json(
            {
              error: 'INSUFFICIENT_CREDITS',
              message: 'No tienes creditos IA suficientes.',
              creditsUsd: charged.creditsUsd,
            },
            { status: 402 },
          );
        } else if (charged.needsGoogleSheetsAuth) {
          needsGoogleSheetsAuth = true;
        } else {
          sheetWarning = 'No se pudo validar el saldo con Google Sheets.';
        }
      } catch (error) {
        console.warn('Credit charge failed:', error);
        sheetWarning = 'No se pudo validar el saldo con Google Sheets.';
      }
    } else {
      needsGoogleSheetsAuth = true;
    }

    const aiResult = await generateAgentReply({
      agent,
      conversation,
      userMessage: message,
    });

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

      if (!hasSheetsScope) {
        needsGoogleSheetsAuth = true;
      } else {
        const sheetResult = await appendMessagesToGoogleSheet({
          accessToken: token?.accessToken,
          refreshToken: token?.refreshToken,
          sheetId,
          sheetTab,
          rows,
          userEmail,
        });

        if (!sheetResult.ok) {
          if (sheetResult.needsGoogleSheetsAuth) {
            needsGoogleSheetsAuth = true;
          } else {
            sheetWarning = 'No se pudo guardar el historial en Google Sheets.';
          }
        } else {
          resolvedSheetId = sheetResult.spreadsheetId;
        }
      }
    } catch (error) {
      console.warn('Google Sheets append failed:', error);
      sheetWarning = 'No se pudo guardar el historial en Google Sheets.';
    }

    return NextResponse.json({
      reply: aiResult.content,
      model: aiResult.model,
      sheetWarning,
      needsGoogleSheetsAuth,
      sheetId: resolvedSheetId,
      sheetTab,
      userEmail,
      creditsUsd: creditState?.creditsUsd ?? availableCredits,
      totalUsageUsd: creditState?.totalUsageUsd ?? null,
      promptCount: creditState?.promptCount ?? null,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const message =
      error instanceof Error && error.message === 'OPENAI_API_KEY_MISSING'
        ? 'Falta configurar OPENAI_API_KEY en el servidor.'
        : 'No se pudo generar la respuesta del agente.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
