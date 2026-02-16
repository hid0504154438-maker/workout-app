'use client';

import { useState, useMemo } from 'react';
import WeekTabs from '../components/WeekTabs';
import DayView from '../components/DayView';
import ProgressBar from '../components/ProgressBar';

export default function ClientHome({ weeks, userSlug }) {
    const [activeWeek, setActiveWeek] = useState(0);
    const [openDay, setOpenDay] = useState(0); // Index of open day in current week

    const currentWeek = weeks[activeWeek];

    // Calculate Weekly Progress
    const weekStats = useMemo(() => {
        if (!currentWeek) return { total: 0, completed: 0 };
        let total = 0;
        let completed = 0;

        currentWeek.days.forEach(day => {
            day.exercises.forEach(ex => {
                total++;
                if (ex.actualSets && ex.actualSets.trim() !== '') {
                    completed++;
                }
            });
        });
        return { total, completed };
    }, [currentWeek]);

    return (
        <main style={{ paddingBottom: '50px' }}>
            {/* Dashboard Header */}
            <div className="container dashboard-header">
                <div className="greeting">
                    <span className="subtitle">Let's crush it! 🔥</span>
                    <h1>My Progress</h1>
                </div>

                <div className="card progress-card">
                    <ProgressBar
                        total={weekStats.total}
                        completed={weekStats.completed}
                        label={`שבוע ${activeWeek + 1} - ${weekStats.completed}/${weekStats.total} תרגילים`}
                    />
                </div>
            </div>

            <WeekTabs
                weeks={weeks}
                activeWeek={activeWeek}
                onSelect={(index) => {
                    setActiveWeek(index);
                    setOpenDay(0); // Reset day on week change
                }}
            />

            <div className="container" style={{ marginTop: '1rem' }}>
                {currentWeek && currentWeek.days.map((day, dIndex) => (
                    <DayView
                        key={`${activeWeek}-${dIndex}`}
                        day={day}
                        weekIndex={activeWeek}
                        dayIndex={dIndex}
                        isOpen={openDay === dIndex}
                        onToggle={() => setOpenDay(openDay === dIndex ? -1 : dIndex)}
                        userSlug={userSlug}
                    />
                ))}

                {!currentWeek && <div style={{ textAlign: 'center', padding: '2rem' }}>No workouts found.</div>}
            </div>

            <style jsx>{`
                .dashboard-header {
                    padding-top: 1.5rem;
                    padding-bottom: 0.5rem;
                }
                .greeting h1 {
                    font-size: 2rem;
                    margin: 0;
                    background: linear-gradient(to right, #fff, #bbb);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .subtitle {
                    color: var(--accent);
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .progress-card {
                    background: linear-gradient(145deg, #1a1a1a, #222);
                    border: 1px solid #333;
                    margin-top: 15px;
                }
            `}</style>
        </main>
    );
}
