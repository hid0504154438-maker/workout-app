import { NextResponse } from 'next/server';
import { getGoogleSheetsInstance } from '@/lib/googleSheets';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const spreadsheetId = searchParams.get('id');

    if (!spreadsheetId) {
        return NextResponse.json({ error: 'Missing spreadsheetId' }, { status: 400 });
    }

    try {
        const sheets = await getGoogleSheetsInstance();
        const response = await sheets.spreadsheets.get({
            spreadsheetId,
        });

        const tabs = response.data.sheets.map(sheet => sheet.properties.title);
        return NextResponse.json({ tabs });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
