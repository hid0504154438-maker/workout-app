import Link from 'next/link';
import { trainees } from '../lib/trainees';

export default function AdminDashboard() {
  return (
    <main className="container" style={{ paddingTop: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>לוח בקרה - מאמן</h1>

      <div className="trainees-grid" style={{ display: 'grid', gap: '1rem' }}>
        {Object.entries(trainees).map(([slug, trainee]) => (
          <Link href={`/${slug}`} key={slug} style={{ textDecoration: 'none' }}>
            <div className="trainee-card" style={{
              background: '#222',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{trainee.name}</h2>
                <p style={{ margin: '5px 0 0', color: '#888', fontSize: '0.9rem' }}>{trainee.activeTab}</p>
              </div>
              <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
