import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/googleSheets';
import { processSheetData } from '@/lib/parser';
import { trainees } from '@/lib/trainees';

export const dynamic = 'force-dynamic';

export async function GET() {
    const trainee = trainees['israel'];
    if (!trainee) return NextResponse.json({ error: 'Israel not found in config' });

    try {
        const range = `${trainee.activeTab}!A:L`;
        const rawData = await getSheetData(trainee.spreadsheetId, range);
        const weeks = processSheetData(rawData);

        return NextResponse.json({
            success: true,
            name: trainee.name,
            weeksCount: weeks.length,
            weekNames: weeks.map(w => w.name),
            rawRowsSample: rawData.slice(0, 20), // Return first 20 rows to inspect structure
            sampleExercise: weeks.length > 0 && weeks[0].days.length > 0 ? weeks[0].days[0].exercises[0] : 'No exercises'
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
    }
}
