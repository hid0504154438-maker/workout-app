import { NextResponse } from 'next/server';
import { getSheetData } from '../../lib/googleSheets';
import { processSheetData } from '../../lib/parser';
import { trainees } from '../../lib/trainees';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userSlug = searchParams.get('user');

    if (!userSlug || !trainees[userSlug]) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const trainee = trainees[userSlug];
    const range = `${trainee.activeTab}!A:L`;

    try {
        const rawData = await getSheetData(trainee.spreadsheetId, range);
        const weeks = processSheetData(rawData);
        return NextResponse.json({ weeks });
    } catch (error) {
        console.error('API Data Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
