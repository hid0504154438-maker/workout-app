import { google } from 'googleapis';
import path from 'path';

export async function getGoogleSheetsInstance() {
    // 1. Try Environment Variable (Production/Vercel)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        try {
            const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
            const auth = new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
            const client = await auth.getClient();
            return google.sheets({ version: 'v4', auth: client });
        } catch (e) {
            // CRITITAL: If env var exists but fails, throw specific error. DO NOT fallback.
            console.error("Env Var Auth Failed:", e);
            throw new Error(`Env Var Auth Failed: ${e.message}`);
        }
    }

    // 2. Try Local File (Localhost only)
    try {
        const filePath = path.join(process.cwd(), 'service_account.json');
        const auth = new google.auth.GoogleAuth({
            keyFile: filePath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const client = await auth.getClient();
        return google.sheets({ version: 'v4', auth: client });
    } catch (err) {
        console.error("Local File Auth Failed:", err);
        throw new Error(`Auth Failed: No Env Var and File not found (${err.message})`);
    }
}

import { unstable_cache } from 'next/cache';

export const getSheetData = unstable_cache(
    async (spreadsheetId, range) => {
        try {
            const sheets = await getGoogleSheetsInstance();
            const res = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
            });
            return res.data.values;
        } catch (error) {
            console.error('Google Sheets API Error:', error.message);
            throw error;
        }
    },
    ['sheet-data'], // Cache key
    { revalidate: 300, tags: ['sheet-data'] } // Revalidate every 5 minutes (300 seconds)
);

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
