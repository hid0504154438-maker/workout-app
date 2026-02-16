import { trainees } from '../lib/trainees';
import TraineeCard from '../components/TraineeCard';

export default function AdminDashboard() {
  return (
    <main className="container" style={{ paddingTop: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>לוח בקרה - מאמן</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>v2.0 (Live Progress)</p>

      <div className="trainees-grid" style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
      }}>
        {Object.entries(trainees).map(([slug, trainee]) => (
          <TraineeCard key={slug} slug={slug} name={trainee.name} />
        ))}
      </div>
    </main>
  );
}
