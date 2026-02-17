import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/googleSheets';
import { trainees } from '@/lib/trainees';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('user') || 'yaakov';
    const trainee = trainees[slug];

    if (!trainee) return NextResponse.json({ error: 'Not found' });

    try {
        const range = `'${trainee.activeTab}'!A1:J50`;
        const rows = await getSheetData(trainee.spreadsheetId, range);
        return NextResponse.json({
            trainee: trainee.name,
            tab: trainee.activeTab,
            rows
        });
    } catch (e) {
        return NextResponse.json({ error: e.message, stack: e.stack });
    }
}
