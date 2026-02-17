import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/googleSheets';
import { trainees } from '@/lib/trainees';

export const dynamic = 'force-dynamic';

export async function GET() {
    const trainee = trainees['david'];
    if (!trainee) return NextResponse.json({ error: 'David not found' });

    try {
        const range = `'${trainee.activeTab}'!A:L`;
        const rows = await getSheetData(trainee.spreadsheetId, range);
        return NextResponse.json({ rows });
    } catch (error) {
        return NextResponse.json({ error: error.message });
    }
}
