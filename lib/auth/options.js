import GoogleProvider from 'next-auth/providers/google';
import { getBaseAppUrl } from '@/lib/config/app-env';

const hasGoogleCredentials = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

const authSecret =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  'techops-local-dev-secret-change-me';
const appBaseUrl = getBaseAppUrl();

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
              prompt: 'consent',
              access_type: 'offline',
              response_type: 'code',
            },
          },
        }),
      ]
    : [],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }
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
