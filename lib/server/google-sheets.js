import { google } from 'googleapis';

const HISTORY_HEADERS = [
  'fecha_hora',
  'agent_id',
  'agent_name',
  'conversation_id',
  'sender',
  'message',
  'model',
  'user_email',
  'credits_charged',
];

const ACCOUNT_SHEET_TAB = 'Cuenta';
const ACCOUNT_HEADERS = [
  'user_email',
  'credits_available',
  'total_usage',
  'prompt_count',
  'updated_at',
];

function createUserOauthClient(accessToken, refreshToken) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL || process.env.PUBLIC_APP_URL || process.env.LOCAL_APP_URL || 'http://localhost:3000'}/api/auth/callback/google`,
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return oauth2Client;
}

async function ensureSheetTab(sheets, spreadsheetId, sheetTab) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = spreadsheet.data.sheets?.some((sheet) => sheet.properties?.title === sheetTab);

  if (exists) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: { title: sheetTab },
          },
        },
      ],
    },
  });
}

async function ensureHeaders(sheets, spreadsheetId, sheetTab) {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetTab}!A1:I1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [HISTORY_HEADERS],
    },
  });
}

async function ensureAccountHeaders(sheets, spreadsheetId) {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${ACCOUNT_SHEET_TAB}!A1:E1`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [ACCOUNT_HEADERS],
    },
  });
}

export async function ensureUserSpreadsheet({ accessToken, refreshToken, sheetId, sheetTab, userEmail }) {
  if (!accessToken) {
    return { ok: false, needsGoogleSheetsAuth: true };
  }

  const auth = createUserOauthClient(accessToken, refreshToken);
  const sheets = google.sheets({ version: 'v4', auth });
  let activeSheetId = sheetId;

  if (!activeSheetId) {
    const created = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `TechOps Memory - ${userEmail || 'usuario'}`,
        },
        sheets: [
          {
            properties: {
              title: sheetTab,
            },
          },
          {
            properties: {
              title: ACCOUNT_SHEET_TAB,
            },
          },
        ],
      },
    });

    activeSheetId = created.data.spreadsheetId;
  } else {
    await ensureSheetTab(sheets, activeSheetId, sheetTab);
    await ensureSheetTab(sheets, activeSheetId, ACCOUNT_SHEET_TAB);
  }

  await ensureHeaders(sheets, activeSheetId, sheetTab);
  await ensureAccountHeaders(sheets, activeSheetId);

  return {
    ok: true,
    spreadsheetId: activeSheetId,
    sheetTab,
    sheets,
  };
}

export async function appendMessagesToGoogleSheet({
  accessToken,
  refreshToken,
  sheetId,
  sheetTab,
  rows,
  userEmail,
}) {
  if (!rows?.length) {
    return { ok: false, skipped: true, reason: 'missing_rows' };
  }

  const ensured = await ensureUserSpreadsheet({
    accessToken,
    refreshToken,
    sheetId,
    sheetTab,
    userEmail,
  });

  if (!ensured.ok) {
    return ensured;
  }

  await ensured.sheets.spreadsheets.values.append({
    spreadsheetId: ensured.spreadsheetId,
    range: `${sheetTab}!A:I`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rows,
    },
  });

  return {
    ok: true,
    spreadsheetId: ensured.spreadsheetId,
    sheetTab,
  };
}

function parseCurrency(value, fallback = 0) {
  const parsed = Number.parseFloat(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatCurrency(value) {
  return Number.parseFloat(Number(value).toFixed(4));
}

export async function ensureUserCredits({
  accessToken,
  refreshToken,
  sheetId,
  sheetTab,
  userEmail,
  defaultCreditsUsd = 0.2,
}) {
  const ensured = await ensureUserSpreadsheet({
    accessToken,
    refreshToken,
    sheetId,
    sheetTab,
    userEmail,
  });

  if (!ensured.ok) {
    return ensured;
  }

  const range = `${ACCOUNT_SHEET_TAB}!A:E`;
  const existing = await ensured.sheets.spreadsheets.values.get({
    spreadsheetId: ensured.spreadsheetId,
    range,
  });

  const rows = existing.data.values ?? [];
  const targetIndex = rows.findIndex((row, index) => index > 0 && row?.[0] === userEmail);

  if (targetIndex > 0) {
    const row = rows[targetIndex];
    return {
      ok: true,
      spreadsheetId: ensured.spreadsheetId,
      creditsUsd: formatCurrency(parseCurrency(row?.[1], defaultCreditsUsd)),
      totalUsageUsd: formatCurrency(parseCurrency(row?.[2], 0)),
      promptCount: Number.parseInt(row?.[3] ?? '0', 10) || 0,
      rowNumber: targetIndex + 1,
    };
  }

  const rowNumber = rows.length + 1;
  await ensured.sheets.spreadsheets.values.update({
    spreadsheetId: ensured.spreadsheetId,
    range: `${ACCOUNT_SHEET_TAB}!A${rowNumber}:E${rowNumber}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[userEmail, formatCurrency(defaultCreditsUsd), 0, 0, new Date().toISOString()]],
    },
  });

  return {
    ok: true,
    spreadsheetId: ensured.spreadsheetId,
    creditsUsd: formatCurrency(defaultCreditsUsd),
    totalUsageUsd: 0,
    promptCount: 0,
    rowNumber,
  };
}

export async function chargeUserCredits({
  accessToken,
  refreshToken,
  sheetId,
  sheetTab,
  userEmail,
  chargeUsd,
  defaultCreditsUsd = 0.2,
}) {
  const accountState = await ensureUserCredits({
    accessToken,
    refreshToken,
    sheetId,
    sheetTab,
    userEmail,
    defaultCreditsUsd,
  });

  if (!accountState.ok) {
    return accountState;
  }

  if (accountState.creditsUsd < chargeUsd) {
    return {
      ok: false,
      insufficientCredits: true,
      spreadsheetId: accountState.spreadsheetId,
      creditsUsd: accountState.creditsUsd,
      totalUsageUsd: accountState.totalUsageUsd,
      promptCount: accountState.promptCount,
    };
  }

  const auth = createUserOauthClient(accessToken, refreshToken);
  const sheets = google.sheets({ version: 'v4', auth });
  const nextCredits = formatCurrency(accountState.creditsUsd - chargeUsd);
  const nextUsage = formatCurrency(accountState.totalUsageUsd + chargeUsd);
  const nextPromptCount = accountState.promptCount + 1;

  await sheets.spreadsheets.values.update({
    spreadsheetId: accountState.spreadsheetId,
    range: `${ACCOUNT_SHEET_TAB}!A${accountState.rowNumber}:E${accountState.rowNumber}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        userEmail,
        nextCredits,
        nextUsage,
        nextPromptCount,
        new Date().toISOString(),
      ]],
    },
  });

  return {
    ok: true,
    spreadsheetId: accountState.spreadsheetId,
    creditsUsd: nextCredits,
    totalUsageUsd: nextUsage,
    promptCount: nextPromptCount,
  };
}
