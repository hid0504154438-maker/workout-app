import { getGoogleSheetsInstance } from '../lib/googleSheets.js'; // Note: using .js extension for local run if type:module is set, or might need adjustment. 
// Actually process.cwd might break in script if not careful.
// Let's make a standalone script that doesn't rely on the app's internal lib too much, or use the app's lib if possible.
// The app is using ES modules (import).
// Let's try to reuse the lib, assuming `package.json` has `type: "module"`.

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listTabs(spreadsheetId) {
    try {
        const sheets = await getGoogleSheetsInstance();
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
    console.log('Usage: node scripts/check-sheet-tabs.js <spreadsheetId>');
} else {
    listTabs(id);
}
