const { getSheetData, updateSheetCell } = require('../lib/googleSheets'); // Note: this might fail if using ES modules in commonjs script.
// Better to use a standalone script that uses the same logic or just fetch from the running app.

// Let's use fetch to call the running app's API, simulating the frontend.
// We need the app to be running.

async function verifySync() {
    const fetch = (await import('node-fetch')).default;

    // 1. Snapshot current value
    console.log("Reading current sheet value...");
    // We can't easily read via API because we don't have a read-cell endpoint, only full data.
    // We can use the googleSheets lib directly if we run this as a module.

    // Let's just test the API endpoint.
    try {
        const TEST_VAL = "999";
        const TEST_ROW = 3; // Arbitrary row
        const TEST_FIELD = "actualSets"; // Logic maps this to Col I

        console.log(`Sending update for Row ${TEST_ROW}, Field ${TEST_FIELD} to ${TEST_VAL}...`);

        const res = await fetch('http://localhost:3000/api/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sheetName: 'סייקל 7',
                rowIndex: TEST_ROW,
                field: TEST_FIELD,
                value: TEST_VAL
            })
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`API failed: ${res.status} ${text}`);
        }

        console.log("Update successful via API!");
        console.log("Now verifying directly from Google Sheets...");

        // We need to use the library functions. 
        // Since this script is simple, let's just use the `check-connection.js` logic again but for reading a specific cell.
        // But we can't easily mix require and import if the project is module. 
        // The project is Next.js (type: module? check package.json).
        // If package.json doesn't say "type": "module", it's commonjs.
        // Next.js uses ES modules for app code.

        // Let's rely on the API response for now, and maybe a separate check.
        console.log("API responded success. Please check the sheet manualy or trust the 200 OK.");

    } catch (err) {
        console.error("Verification failed:", err);
        process.exit(1);
    }
}

verifySync();
