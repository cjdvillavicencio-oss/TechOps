import GoogleProvider from 'next-auth/providers/google';
import { getBaseAppUrl } from '@/lib/config/app-env';

const GOOGLE_SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

const hasGoogleCredentials = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

const authSecret =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  'techops-local-dev-secret-change-me';

const appBaseUrl = getBaseAppUrl();

async function refreshGoogleAccessToken(token) {
  if (!token.refreshToken) return token;

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    const refreshed = await response.json();
    if (!response.ok) {
      throw refreshed;
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      expiresAt: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      scopes: refreshed.scope ? refreshed.scope.split(' ') : token.scopes,
      authError: null,
    };
  } catch (error) {
    console.error('Error refreshing Google access token:', error);
    return {
      ...token,
      authError: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions = {
  secret: authSecret,
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === 'production',
  session: {
    strategy: 'jwt',
  },
  providers: hasGoogleCredentials
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              scope: 'openid email profile',
              prompt: 'consent',
              access_type: 'offline',
              response_type: 'code',
            },
          },
        }),
      ]
    : [],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token ?? token.refreshToken,
          expiresAt: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
          scopes: account.scope ? account.scope.split(' ') : [],
          authError: null,
        };
      }

      if (token.expiresAt && Date.now() < token.expiresAt - 60 * 1000) {
        return token;
      }

      return refreshGoogleAccessToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.hasSheetsAccess = Array.isArray(token.scopes)
          ? token.scopes.includes(GOOGLE_SHEETS_SCOPE)
          : false;
      }
      session.authError = token.authError ?? null;
      return session;
    },
    async redirect({ url, baseUrl }) {
      const safeBaseUrl = appBaseUrl || baseUrl;
      if (url.startsWith('/')) return `${safeBaseUrl}${url}`;
      if (url.startsWith(safeBaseUrl)) return url;
      return safeBaseUrl;
    },
  },
  pages: {
    signIn: '/',
  },
  debug: process.env.NODE_ENV === 'development',
};

export const googleAuthEnabled = hasGoogleCredentials;
export const googleSheetsScope = GOOGLE_SHEETS_SCOPE;
