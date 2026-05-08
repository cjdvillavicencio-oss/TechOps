export const ACCOUNT_STORAGE_PREFIX = 'techops.account.v1';

export function getAccountStorageKey(email) {
  return `${ACCOUNT_STORAGE_PREFIX}:${email}`;
}

export function createDefaultAccount(email = '') {
  return {
    email,
    creditsUsd: 0.5,
    totalUsageUsd: 0,
    promptCount: 0,
    responseCostUsd: 0.0005,
    planName: 'Starter',
    planStatus: 'Regalo activo',
    apiKeys: {
      openai: '',
      anthropic: '',
    },
    settings: {
      displayName: '',
      locale: 'es',
      notifyCredits: true,
      sheets: {
        sheetId: '',
        sheetTab: 'Historial',
        connectionMethod: 'service-account-env',
      },
    },
  };
}

export function normalizeAccount(rawAccount, email = '') {
  const fallback = createDefaultAccount(email);

  return {
    email: email || rawAccount?.email || '',
    creditsUsd:
      typeof rawAccount?.creditsUsd === 'number' ? rawAccount.creditsUsd : fallback.creditsUsd,
    totalUsageUsd:
      typeof rawAccount?.totalUsageUsd === 'number'
        ? rawAccount.totalUsageUsd
        : fallback.totalUsageUsd,
    promptCount:
      typeof rawAccount?.promptCount === 'number' ? rawAccount.promptCount : fallback.promptCount,
    responseCostUsd:
      typeof rawAccount?.responseCostUsd === 'number'
        ? rawAccount.responseCostUsd
        : fallback.responseCostUsd,
    planName:
      typeof rawAccount?.planName === 'string' && rawAccount.planName.trim()
        ? rawAccount.planName
        : fallback.planName,
    planStatus:
      typeof rawAccount?.planStatus === 'string' && rawAccount.planStatus.trim()
        ? rawAccount.planStatus
        : fallback.planStatus,
    apiKeys: {
      openai: typeof rawAccount?.apiKeys?.openai === 'string' ? rawAccount.apiKeys.openai : '',
      anthropic:
        typeof rawAccount?.apiKeys?.anthropic === 'string' ? rawAccount.apiKeys.anthropic : '',
    },
    settings: {
      displayName:
        typeof rawAccount?.settings?.displayName === 'string'
          ? rawAccount.settings.displayName
          : '',
      locale:
        typeof rawAccount?.settings?.locale === 'string'
          ? rawAccount.settings.locale
          : fallback.settings.locale,
      notifyCredits:
        typeof rawAccount?.settings?.notifyCredits === 'boolean'
          ? rawAccount.settings.notifyCredits
          : fallback.settings.notifyCredits,
      sheets: {
        sheetId:
          typeof rawAccount?.settings?.sheets?.sheetId === 'string'
            ? rawAccount.settings.sheets.sheetId
            : fallback.settings.sheets.sheetId,
        sheetTab:
          typeof rawAccount?.settings?.sheets?.sheetTab === 'string' &&
          rawAccount.settings.sheets.sheetTab.trim()
            ? rawAccount.settings.sheets.sheetTab
            : fallback.settings.sheets.sheetTab,
        connectionMethod:
          typeof rawAccount?.settings?.sheets?.connectionMethod === 'string' &&
          rawAccount.settings.sheets.connectionMethod.trim()
            ? rawAccount.settings.sheets.connectionMethod
            : fallback.settings.sheets.connectionMethod,
      },
    },
  };
}

export function getProviderOptions() {
  return [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'starxia-openai', label: 'Starxia OpenAI (gratis 0.5 USD de regalo)' },
  ];
}

export function getModelOptions(provider) {
  const options = {
    openai: ['gpt-5-mini', 'gpt-4.1', 'gpt-4.1-mini'],
    anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
    'starxia-openai': ['gpt-4.1-mini', 'gpt-4o-mini'],
  };

  return options[provider] ?? [];
}
