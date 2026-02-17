const { getSheetData } = require('../lib/googleSheets');
const { trainees } = require('../lib/trainees');

// Mock process.env for local run if needed, or rely on .env loading if run via next or similar.
// Since we are running via node, we might need to load dotenv.
require('dotenv').config({ path: '.env.local' });

async function run() {
    const slug = 'yaakov';
    const trainee = trainees[slug];
    if (!trainee) {
        console.error('Trainee not found');
        return;
    }

    console.log(`Fetching data for ${trainee.name} (${trainee.spreadsheetId}) - Tab: ${trainee.activeTab}`);

    try {
        // Fetch first 100 rows
        const range = `'${trainee.activeTab}'!A1:H50`;
        const rows = await getSheetData(trainee.spreadsheetId, range);

        console.log('--- RAW DATA START ---');
        rows.forEach((row, i) => {
            console.log(`Row ${i + 1}: ${JSON.stringify(row)}`);
        });
        console.log('--- RAW DATA END ---');

    } catch (error) {
        console.error('Error:', error);
    }
}

// We need to bypass the export/import ES6 issue if we run this with plain node.
// But the project is using ES6 modules (import/export).
// Accessing these requires using `babel-node` or changing extensions to .mjs, or...
// Easier way for me right now: Creates a small Next.js API route helper or just use the existing /debug page logic?
// actually, I will just create a temporary API route that console logs the data, then I can curl it.
// That avoids environment setup issues with standalone scripts.
