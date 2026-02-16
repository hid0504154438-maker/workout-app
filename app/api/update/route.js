import { updateSheetCell } from '@/lib/googleSheets';
import { NextResponse } from 'next/server';
import { trainees } from '@/lib/trainees';

export async function POST(request) {
    try {
        const body = await request.json();
        const { userSlug, rowIndex, field, value } = body;

        // Resolve Trainee
        const trainee = trainees[userSlug];
        if (!trainee) {
            return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
        }

        const sheetName = trainee.activeTab; // Use configured active tab

        // Define column mapping based on field name
        // Col I (8) = Actual Sets
        // Col J (9) = Actual Reps
        // Col K (10) = Actual Weight

        let colLetter = '';
        if (field === 'actualSets') colLetter = 'I';
        if (field === 'actualReps') colLetter = 'J';
        if (field === 'actualWeight') colLetter = 'K';

        if (!colLetter) {
            return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
        }

        const range = `'${sheetName}'!${colLetter}${rowIndex}`;

        await updateSheetCell(trainee.spreadsheetId, range, value);

        return NextResponse.json({ success: true, range, value });
    } catch (error) {
        console.error('Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
