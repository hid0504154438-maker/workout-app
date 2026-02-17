'use client';
import { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';

export default function TraineeCard({ slug, name }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch trainee data to calculate progress
        fetch(`/api/data?user=${slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.weeks) {
                    let completed = 0;
                    let total = 0;
                    // Get the latest week (last in the array)
                    const latestWeek = data.weeks[data.weeks.length - 1];
                    if (latestWeek) {
                        latestWeek.days.forEach(day => {
                            day.exercises.forEach(ex => {
                                total++;
                                if (ex.actualSets && String(ex.actualSets).trim().length > 0) completed++;
                            });
                        });
                    }
                    setStats({ completed, total });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [slug]);

    return (
        <a href={`/${slug}`} className="trainee-card">
            <div className="trainee-info">
                <span className="name">{name}</span>
            </div>

            <div className="trainee-progress">
                {loading ? (
                    <span className="loading-text">טוען...</span>
                ) : stats ? (
                    <div className="progress-wrapper">
                        <ProgressBar
                            total={stats.total}
                            completed={stats.completed}
                            color="var(--accent)"
                            label=""
                        />
                        <div className="stats-text">{Math.round((stats.completed / (stats.total || 1)) * 100)}%</div>
                    </div>
                ) : (
                    <span className="error-text">-</span>
                )}
            </div>

            <style jsx>{`
                .trainee-card {
                    display: block;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 10px;
                    text-decoration: none;
                    color: inherit;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .trainee-card:hover {
                    border-color: var(--accent);
                    background: #222;
                    transform: translateY(-2px);
                }
                .name {
                    font-weight: bold;
                    font-size: 1.1rem;
                    display: block;
                }
                .slug {
                    font-size: 0.8em;
                    color: #666;
                }
                .trainee-progress {
                    width: 40%;
                    min-width: 120px;
                }
                .progress-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .stats-text {
                    font-size: 0.9rem;
                    font-weight: bold;
                    color: var(--accent);
                    min-width: 35px;
                }
                .loading-text { font-size: 0.8em; color: #666; }
            `}</style>
        </a>
    );
}
