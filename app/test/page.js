import { getGoogleSheetsInstance } from '../../lib/googleSheets';

export const dynamic = 'force-dynamic';

export default async function TestPage() {
    const envVar = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const hasKey = !!envVar;
    let status = 'Unknown';
    let error = null;

    try {
        if (hasKey) {
            JSON.parse(envVar);
            // Try to actually connect
            const sheets = await getGoogleSheetsInstance();
            status = 'Connected to Google Sheets Successfully!';
        } else {
            status = 'Missing Environment Variable (GOOGLE_SERVICE_ACCOUNT_KEY)';
        }
    } catch (e) {
        status = 'Connection Failed';
        error = e.message;
    }

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
            <h1>Deployment Status</h1>

            <div style={{
                padding: '2rem',
                border: '1px solid #333',
                borderRadius: '8px',
                margin: '2rem auto',
                maxWidth: '600px',
                background: hasKey && !error ? '#d4edda' : '#f8d7da',
                color: hasKey && !error ? '#155724' : '#721c24'
            }}>
                <h2>{status}</h2>
                {error && <p><strong>Error Details:</strong> {error}</p>}
            </div>

            <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
                <h3>Debug Info:</h3>
                <p><strong>Env Var Exists:</strong> {hasKey ? '✅ YES' : '❌ NO'}</p>
                <p><strong>Key Length:</strong> {envVar ? envVar.length : 0} characters</p>
                <p><strong>Node Env:</strong> {process.env.NODE_ENV}</p>
            </div>
        </div>
    );
}
