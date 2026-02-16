import { google } from 'googleapis';
import path from 'path';

export async function getGoogleSheetsInstance() {
    let auth;

    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        try {
            const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
            auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
        } catch (e) {
            console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY", e);
        }
    }

    if (!auth) {
        // Only try to load file if env var failed or wasn't present
        try {
            auth = new google.auth.GoogleAuth({
                keyFile: path.join(process.cwd(), 'service_account.json'),
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
        } catch (err) {
            console.error("Failed to load local service_account.json", err);
            throw new Error("Authentication failed: No valid credentials found (Env Var or File).");
        }
    }

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    return sheets;
}

export async function getSheetData(spreadsheetId, range) {
    const sheets = await getGoogleSheetsInstance();
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return res.data.values;
}

export async function updateSheetCell(spreadsheetId, range, value) {
    const sheets = await getGoogleSheetsInstance();
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[value]],
        },
    });
}
