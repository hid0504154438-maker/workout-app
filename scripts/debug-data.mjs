import { getSheetData } from '../lib/googleSheets.js';
import { processSheetData } from '../lib/parser.js';
import { trainees } from '../lib/trainees.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

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
            }

            const weeks = processSheetData(rawData);
            console.log(`Parsed Weeks: ${weeks.length}`);

            weeks.forEach((w, i) => {
                console.log(`  Week ${i + 1}: ${w.days.length} days`);
                w.days.forEach((d, j) => {
                    console.log(`    Day ${j + 1} (${d.name}): ${d.exercises.length} exercises`);
                });
            });

        } catch (err) {
            console.error(`ERROR fetching/parsing for ${slug}:`, err);
        }
    }
}

debugData();
