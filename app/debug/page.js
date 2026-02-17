import { trainees } from '../../lib/trainees';
import { getSheetData } from '../../lib/googleSheets';

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    const results = [];

    for (const [slug, trainee] of Object.entries(trainees)) {
        try {
            // Try to fetch just A1 to verify sheet and tab existence
            await getSheetData(trainee.spreadsheetId, `${trainee.activeTab}!A1`);
            results.push({ slug, name: trainee.name, status: '✅ OK', error: null });
        } catch (e) {
            let errorMsg = e.message;
            if (e.message.includes('403')) errorMsg = 'Access Denied (Service Account need Editor permission)';
            if (e.message.includes('400')) errorMsg = `Tab "${trainee.activeTab}" not found (Check name matches exactly)`;

            results.push({
                slug,
                name: trainee.name,
                status: '❌ Error',
                error: errorMsg
            });
        }
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', direction: 'rtl' }}>
            <h1>דוח סטטוס מתאמנים (Debug)</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ background: '#333', color: '#fff' }}>
                        <th style={{ padding: '10px', textAlign: 'right' }}>שם</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>מזהה (Slug)</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>טאב פעיל</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>סטטוס</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>שגיאה</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map(r => (
                        <tr key={r.slug} style={{ borderBottom: '1px solid #ccc', background: r.status.includes('OK') ? '#dcfce7' : '#fee2e2' }}>
                            <td style={{ padding: '10px' }}>{r.name}</td>
                            <td style={{ padding: '10px' }}>{r.slug}</td>
                            <td style={{ padding: '10px' }}>{trainees[r.slug].activeTab}</td>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{r.status}</td>
                            <td style={{ padding: '10px', color: '#ef4444' }}>{r.error}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ marginTop: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '5px' }}>
                <h3>הנחיות לתיקון:</h3>
                <ul>
                    <li><strong>Access Denied (403):</strong> צריך להוסיף את האימייל של ה-Service Account כ-Editor לקובץ של המתאמן.</li>
                    <li><strong>Tab not found (400):</strong> שם הגיליון (Tab) בקובץ לא תואם בדיוק למה שכתוב ב-Code. בדוק רווחים מיותרים!</li>
                </ul>
            </div>
        </div>
    );
}
