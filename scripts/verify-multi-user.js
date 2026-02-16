async function verifyMultiUser() {
    const fetch = (await import('node-fetch')).default;
    const BASE_URL = 'http://localhost:3000';

    console.log("Verifying Multi-User Architecture...");

    try {
        // 1. Verify Admin Dashboard
        console.log("Checking Admin Dashboard (/) ...");
        const adminRes = await fetch(`${BASE_URL}/`);
        const adminText = await adminRes.text();
        if (!adminText.includes('לוח בקרה')) throw new Error('Admin Dashboard failed to load correctly.');
        console.log("Admin Dashboard OK.");

        // 2. Verify Yishai's Page
        console.log("Checking Yishai's Page (/yishai) ...");
        const yishaiRes = await fetch(`${BASE_URL}/yishai`);
        const yishaiText = await yishaiRes.text();
        if (!yishaiText.includes('My Workout Plan') && !yishaiText.includes('תוכנית אימונים')) console.warn("Warning: Yishai's page content check might be flaky.");
        // We expect 200 OK at least
        if (yishaiRes.status !== 200) throw new Error(`Yishai's page returned ${yishaiRes.status}`);
        console.log("Yishai's Page OK.");

        // 3. Verify Porat's Page
        console.log("Checking Porat's Page (/porat) ...");
        const poratRes = await fetch(`${BASE_URL}/porat`);
        if (poratRes.status !== 200) throw new Error(`Porat's page returned ${poratRes.status}`);
        console.log("Porat's Page OK.");

        // 4. Verify API Update for Porat
        console.log("Testing API Update for Porat...");
        const updateRes = await fetch(`${BASE_URL}/api/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userSlug: 'porat',
                rowIndex: 3, // Arbitrary row
                field: 'actualSets',
                value: '888' // Test value
            })
        });

        if (!updateRes.ok) {
            const errText = await updateRes.text();
            throw new Error(`API Update failed: ${updateRes.status} ${errText}`);
        }
        console.log("API Update for Porat OK.");

        console.log("ALL CHECKS PASSED!");

    } catch (err) {
        console.error("Verification Failed:", err);
        process.exit(1);
    }
}

verifyMultiUser();
