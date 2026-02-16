import { google } from 'googleapis';

export async function POST(req) {
    try {
        const { timestamp, user, action, label, metadata } = await req.json();

        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = '1SN5dzRynIQVl-axlrRU4re0AMTJES7i4H2C_4a-3GK4'; // Provided by User for Analytics

        // Append to 'Analytics' sheet
        // Columns: Timestamp, User, Action, Label, Metadata
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Analytics!A:E',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[
                    timestamp || new Date().toISOString(),
                    user || 'Anonymous',
                    action,
                    label,
                    JSON.stringify(metadata || {})
                ]],
            },
        });

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
}
