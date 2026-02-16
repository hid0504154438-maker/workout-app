const { google } = require('googleapis');
const path = require('path');

async function checkSheet() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), 'service_account.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        const spreadsheetId = '10B-KLnF1L8ZM5C6Mx7vAbNbJx4gL6mRrL39gWrtLxso';

        console.log('Fetching metadata for spreadsheet:', spreadsheetId);
        const res = await sheets.spreadsheets.get({
            spreadsheetId,
        });

        console.log('Connection Successful!');
        console.log('Title:', res.data.properties.title);
        console.log('Sheets:');
        res.data.sheets.forEach(sheet => {
            console.log(`- ${sheet.properties.title} (ID: ${sheet.properties.sheetId})`);
        });

    } catch (error) {
        console.error('Error connecting to sheet:', error.message);
        if (error.response) {
            console.error('Details:', error.response.data);
        }
    }
}

checkSheet();
