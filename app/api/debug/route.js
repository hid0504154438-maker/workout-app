import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/googleSheets';
import { trainees } from '@/lib/trainees';

export async function GET() {
    const trainee = trainees['porat'];
    if (!trainee) return NextResponse.json({ error: 'Porat not found' });

    try {
        const range = `'${trainee.activeTab}'!A1:L50`;
        const rows = await getSheetData(trainee.spreadsheetId, range);
        return NextResponse.json({ rows });
    } catch (error) {
        return NextResponse.json({ error: error.message, stack: error.stack });
    }
}
