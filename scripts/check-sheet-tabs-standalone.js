const { google } = require('googleapis');
const path = require('path');

// --- Configuration ---
const SPREADSHEET_ID = process.argv[2]; // Get ID from command line argument
const KEY_FILE_PATH = path.join(process.cwd(), 'service-account.json'); // Adjust path as needed

if (!SPREADSHEET_ID) {
    console.error('Please provide a Spreadsheet ID as an argument.');
    process.exit(1);
}

async function listTabs() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const tabs = response.data.sheets.map(sheet => sheet.properties.title);
        console.log('Tabs in spreadsheet:', tabs);

    } catch (error) {
        console.error('Error listing tabs:', error.message);
    }
}

listTabs();
