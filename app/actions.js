'use server';

import { getGoogleSheetsInstance } from '@/lib/googleSheets'; // Adjust path if needed
import { revalidatePath, revalidateTag } from 'next/cache';
import { trainees } from '@/lib/trainees';

export async function updateExerciseAction(userSlug, dayName, exerciseName, field, value) {
    console.log(`Setting up update for ${userSlug}: ${dayName} - ${exerciseName} [${field} = ${value}]`);

    const trainee = trainees[userSlug];
    if (!trainee) {
        return { success: false, message: 'Trainee not found' };
    }

    try {
        const sheets = await getGoogleSheetsInstance();
        const spreadsheetId = trainee.spreadsheetId;
        const range = `${trainee.activeTab}!A:L`;

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = response.data.values;
        let targetRowIndex = -1;
        let dayFound = false;

        // Robust Scan Logic
        const normalize = (str) => str ? str.toString().trim().toLowerCase() : '';
        const targetDay = normalize(dayName);
        const targetExercise = normalize(exerciseName);

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowDay = normalize(row[0]);
            const rowEx = normalize(row[1]);

            if (rowDay === targetDay) {
                dayFound = true;
            }

            // Check exercise match. Note: exact match required.
            if (dayFound && rowEx === targetExercise) {
                targetRowIndex = i + 1;
                break;
            }
        }

        if (targetRowIndex === -1) {
            console.error(`Row not found for ${dayName} / ${exerciseName}`);
            return { success: false, message: 'Exercise row not found' };
        }

        // Map fields to columns (I, J, K, L)
        let colLetter = '';
        if (field === 'actualSets') colLetter = 'I';
        if (field === 'actualReps') colLetter = 'J';
        if (field === 'actualWeight') colLetter = 'K';
        if (field === 'notes') colLetter = 'L';

        if (!colLetter) {
            return { success: false, message: 'Invalid field' };
        }

        const updateRange = `${trainee.activeTab}!${colLetter}${targetRowIndex}`;

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: updateRange,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[value]]
            }
        });

        // Invalidate the specific Sheet Data Cache
        revalidateTag(`sheet-${spreadsheetId}`);
        revalidatePath(`/${userSlug}`);

        return { success: true, message: 'Updated' };

    } catch (error) {
        console.error('Update Error:', error);
        return { success: false, message: 'Server error' };
    }
}
