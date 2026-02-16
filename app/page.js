import { trainees } from '../lib/trainees';
import TraineeCard from '../components/TraineeCard';

export default function AdminDashboard() {
  return (
    <main className="container" style={{ paddingTop: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>לוח בקרה - מאמן</h1>

      <div className="trainees-grid">
        {Object.entries(trainees).map(([slug, trainee]) => (
          <TraineeCard key={slug} slug={slug} name={trainee.name} />
        ))}
      </div>

      <style jsx>{`
        .trainees-grid {
            display: grid;
            gap: 1rem;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }
      `}</style>
    </main>
  );
}
