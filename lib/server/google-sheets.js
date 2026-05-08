import { google } from 'googleapis';

function getServiceAccountConfig() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    return null;
  }

  return { clientEmail, privateKey };
}

async function createSheetsClient() {
  const config = getServiceAccountConfig();
  if (!config) return null;

  const auth = new google.auth.JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  await auth.authorize();

  return google.sheets({ version: 'v4', auth });
}

export async function appendMessagesToGoogleSheet({ sheetId, sheetTab, rows }) {
  if (!sheetId || !sheetTab || !rows?.length) {
    return { ok: false, skipped: true, reason: 'missing_sheet_config' };
  }

  const sheets = await createSheetsClient();
  if (!sheets) {
    return { ok: false, skipped: true, reason: 'missing_service_account' };
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${sheetTab}!A:I`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rows,
    },
  });

  return { ok: true };
}
