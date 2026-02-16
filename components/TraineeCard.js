'use client';
import { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';

export default function TraineeCard({ slug, name }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch trainee data to calculate progress
        // Note: activeTab is handled by the API based on the sheet attached to the userSlug
        fetch(`/api/data?user=${slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.weeks) {
                    // Calculate current week progress (assuming week 0 or latest active?)
                    // For simplicity, let's take the first week (Week 1) or sum total?
                    // Let's sum TOTAL active progress for the current displayed cycle.
                    // Find last activity date
                    let lastActivityFn = null;

                    data.weeks.forEach(week => {
                        week.days.forEach(day => {
                            day.exercises.forEach(ex => {
                                total++;
                                if (ex.actualSets && ex.actualSets.trim()) {
                                    completed++;
                                    // Parse date if available. The structure might not have per-exercise date, 
                                    // but we have week date range.
                                    // Actually, we don't have exact date per exercise in current data model.
                                    // We can approximate based on "current week" being active? 
                                    // Wait, the progress is calculated on the fly. 
                                    // If we want TRUE "last activity", we need to store timestamps or have the user input dates.
                                    // For now, let's use a simpler heuristic:
                                    // If they have ANY completion in the *current* week (last in array reversed?? No wait, API returns data.weeks).
                                    // Let's assume the weeks are usually chronological.
                                    // If the *latest* week has data, they are active.
                                    // If not, check previous week.
                                }
                            });
                        });
                    });

                    // REVISED LOGIC for "Last Activity":
                    // Since we don't have timestamps, we can't do "4 days ago" accurately without a real date field in the input.
                    // However, we know if they worked out *this week*.
                    // Let's rely on: "Has completed > 0 exercises in the CURRENT week?"
                    // If yes -> Green.
                    // If no -> Red.
                    // This is a good proxy for "4 days" (half a week).
                    // We need to know which week is "current" based on date.
                    // We can reuse the `isWeekActive` logic essentially, or just check the last week in the list (assuming it's current).
                    // Let's check the last 2 weeks. If zero activity in last 2 weeks -> Red.

                    // Actually, let's look for ANY completion in the `isActive` week or the one before it.
                    // `data.weeks` is the full array.
                    // Let's assume the last week in the array is the latest.
                    const reversedWeeks = [...data.weeks].reverse();
                    let hasRecentActivity = false;

                    // Check last 2 weeks
                    for (let i = 0; i < Math.min(2, reversedWeeks.length); i++) {
                        const week = reversedWeeks[i];
                        let weekHasActivity = false;
                        week.days.forEach(d => {
                            if (d.exercises.some(e => e.actualSets && e.actualSets.trim())) weekHasActivity = true;
                        });
                        if (weekHasActivity) {
                            hasRecentActivity = true;
                            break;
                        }
                    }

                    setStats({ completed, total, hasRecentActivity });
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="name">{name}</span>
                    {!loading && stats && (
                        <span
                            className={`status-indicator ${stats.hasRecentActivity ? 'active' : 'inactive'}`}
                            title={stats.hasRecentActivity ? 'פעיל לאחרונה' : 'לא פעיל (דורש בדיקה)'}
                        ></span>
                    )}
                </div>
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
                .status-indicator {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    display: inline-block;
                }
                .status-indicator.active {
                    background-color: #22c55e;
                    box-shadow: 0 0 5px #22c55e;
                }
                .status-indicator.inactive {
                    background-color: #ef4444;
                    box-shadow: 0 0 5px #ef4444;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
                .loading-text { font-size: 0.8em; color: #666; }
            `}</style>
        </a>
    );
}
