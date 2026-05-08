import { NextResponse } from 'next/server';
import { getBaseAppUrl, getGoogleCallbackUrl, isProductionApp } from '@/lib/config/app-env';
import { googleAuthEnabled } from '@/lib/auth/options';

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: isProductionApp() ? 'production' : 'development',
    baseUrl: getBaseAppUrl(),
    googleCallbackUrl: getGoogleCallbackUrl(),
    googleAuthConfigured: googleAuthEnabled,
    openAiConfigured: Boolean(process.env.OPENAI_API_KEY),
    sheetsConfigured: Boolean(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    ),
  });
}
