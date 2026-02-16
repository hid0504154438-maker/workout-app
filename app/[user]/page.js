import { getSheetData } from '../../lib/googleSheets';
import { processSheetData } from '../../lib/parser';
import ClientHome from '../../app/client-page';
import { trainees } from '../../lib/trainees';

export const dynamic = 'force-dynamic';

export default async function TraineePage({ params }) {
    const { user } = await params;
    const trainee = trainees[user];

    if (!trainee) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <h1>User Not Found</h1>
                <p>The trainee "{user}" does not exist in the system.</p>
            </div>
        );
    }

    const range = `${trainee.activeTab}!A:L`;

    let weeks = [];
    try {
        const rawData = await getSheetData(trainee.spreadsheetId, range);
        weeks = processSheetData(rawData);
    } catch (err) {
        console.error(err);
        return <div className="container">Error loading data for {trainee.name}: {err.message}</div>
    }

    return (
        <div>
            <div style={{
                background: '#111',
                textAlign: 'center',
                padding: '5px',
                fontSize: '0.8rem',
                color: '#666'
            }}>
                מחובר כ: {trainee.name}
            </div>
            <ClientHome weeks={weeks} userSlug={user} />
        </div>
    );
}
