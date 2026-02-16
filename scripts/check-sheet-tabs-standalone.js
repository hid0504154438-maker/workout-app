const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

async function listTabs(spreadsheetId) {
    try {
        let auth;
        const keyPath = path.join(__dirname, '..', 'service_account.json');

        if (fs.existsSync(keyPath)) {
            auth = new google.auth.GoogleAuth({
                keyFile: keyPath,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
        } else {
            console.error('Service account file not found');
            return;
        }

        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        const response = await sheets.spreadsheets.get({
            spreadsheetId,
        });

        const tabs = response.data.sheets.map(s => s.properties.title);
        console.log(`Tabs for ${spreadsheetId}:`);
        tabs.forEach(t => console.log(`- ${t}`));
        return tabs;
    } catch (error) {
        console.error('Error fetching tabs:', error.message);
    }
}

const id = process.argv[2];
if (!id) {
    console.log('Usage: node scripts/check-sheet-tabs-standalone.js <spreadsheetId>');
} else {
    listTabs(id);
}
