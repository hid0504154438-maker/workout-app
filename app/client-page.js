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
        <AuthGate userSlug={userSlug} passcode={passcode}>
            <main className="main-layout">
                <div className="side-nav">
                    <WeekTabs
                        weeks={weeks}
                        activeWeek={activeWeek}
                        onSelect={(index) => {
                            setActiveWeek(index);
                            setOpenDay(0);
                        }}
                        orientation="vertical"
                    />
                </div>

                <div className="content-area">
                    {/* Dashboard Header */}
                    <div className="dashboard-header">
                        <div className="greeting">
                            <h1>My Progress</h1>
                            <span className="subtitle">Let's crush it! 🔥</span>
                        </div>

                        <div className="card progress-card">
                            <ProgressBar
                                total={weekStats.total}
                                completed={weekStats.completed}
                                label={`שבוע ${activeWeek + 1}`}
                            />
                        </div>
                    </div>

                    <div className="days-container">
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
                </div>

                <style jsx>{`
                    .main-layout {
                        display: flex;
                        flex-direction: row; /* RTL by default due to global CSS */
                        height: 100vh;
                        overflow: hidden;
                    }
                    .side-nav {
                        width: 70px;
                        background: #111;
                        border-left: 1px solid #333;
                        overflow-y: auto;
                        flex-shrink: 0;
                    }
                    .content-area {
                        flex-grow: 1;
                        overflow-y: auto;
                        padding: 15px;
                        padding-bottom: 80px;
                    }
                    .dashboard-header {
                        margin-bottom: 20px;
                    }
                    .greeting h1 {
                        font-size: 1.5rem;
                        margin: 0 0 5px 0;
                    }
                    .subtitle {
                        color: var(--accent);
                        font-size: 0.9rem;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        display: block;
                        margin-bottom: 10px;
                    }
                    .progress-card {
                        padding: 10px;
                        background: #222;
                        border-radius: 8px;
                    }
                `}</style>
            </main>
        </AuthGate>
    );
}
