const { getSheetData } = require('../lib/googleSheets');
const { processSheetData } = require('../lib/parser');
const { trainees } = require('../lib/trainees');

// Mock env vars for local execution if needed, or rely on .env.local loading if run via next or dotenv
require('dotenv').config({ path: '.env.local' });

async function debugData() {
    console.log('--- Debugging Data Fetching ---');

    for (const [slug, trainee] of Object.entries(trainees)) {
        console.log(`\nChecking User: ${slug} (${trainee.name})`);
        console.log(`Spreadsheet ID: ${trainee.spreadsheetId}`);
        console.log(`Tab: ${trainee.activeTab}`);

        const range = `'${trainee.activeTab}'!A:L`;

        try {
            const rawData = await getSheetData(trainee.spreadsheetId, range);
            console.log(`Raw Rows Fetched: ${rawData ? rawData.length : 0}`);

            if (rawData && rawData.length > 0) {
                console.log('Sample Row 0:', rawData[0]);
                if (rawData.length > 10) console.log('Sample Row 10:', rawData[10]);
            }

            const weeks = processSheetData(rawData);
            console.log(`Parsed Weeks: ${weeks.length}`);

            weeks.forEach((w, i) => {
                console.log(`  Week ${i + 1}: ${w.days.length} days`);
                w.days.forEach((d, j) => {
                    console.log(`    Day ${j + 1} (${d.name}): ${d.exercises.length} exercises`);
                    if (d.exercises.length > 0) {
                        console.log(`      Ex 1: ${d.exercises[0].name}`);
                    }
                });
            });

        } catch (err) {
            console.error(`ERROR fetching/parsing for ${slug}:`, err);
        }
    }
}

// We need to make sure `googleSheets.js` and `parser.js` can run in this CommonJS script or use ES modules.
// Since the project is using ES modules (import/export), we should name this .mjs or use dynamic import.
// Let's rewrite this content to be strictly ES module friendly and run with `node`.
