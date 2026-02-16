import { getSheetData } from '../lib/googleSheets.js';
import { trainees } from '../lib/trainees.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fetchRawPorat() {
    const trainee = trainees['porat'];
    console.log(`Fetching data for ${trainee.name} from ${trainee.activeTab}`);

    // Fetch first 50 rows
    const range = `'${trainee.activeTab}'!A1:L50`;
    const rows = await getSheetData(trainee.spreadsheetId, range);

    console.log('--- Raw Data Start ---');
    rows.forEach((row, i) => {
        console.log(`Row ${i + 1}: ${JSON.stringify(row)}`);
    });
    console.log('--- Raw Data End ---');
}

fetchRawPorat();
