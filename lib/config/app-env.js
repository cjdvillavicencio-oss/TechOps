function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

export function getLocalAppUrl() {
  return trimTrailingSlash(process.env.LOCAL_APP_URL || 'http://localhost:3000');
}

export function getPublicAppUrl() {
  return trimTrailingSlash(process.env.PUBLIC_APP_URL || '');
}

export function isProductionApp() {
  return process.env.NODE_ENV === 'production';
}

export function getBaseAppUrl() {
  if (process.env.NEXTAUTH_URL) {
    return trimTrailingSlash(process.env.NEXTAUTH_URL);
  }

  if (isProductionApp() && getPublicAppUrl()) {
    return getPublicAppUrl();
  }

  return getPublicAppUrl() || getLocalAppUrl();
}

export function getGoogleCallbackUrl() {
  return `${getBaseAppUrl()}/api/auth/callback/google`;
}
