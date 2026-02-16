'use client';

import { useState, useMemo } from 'react';
import WeekTabs from '../components/WeekTabs';
import DayView from '../components/DayView';
import ProgressBar from '../components/ProgressBar';
import AuthGate from '../components/AuthGate';

export default function ClientHome({ weeks: initialWeeks, userSlug, passcode }) {
    // Reverse weeks so the latest is first (User Request)
    const weeks = useMemo(() => [...initialWeeks].reverse(), [initialWeeks]);

    // Helper: Parse date range "DD.MM - DD.MM"
    const isWeekActive = (dateRange) => {
        if (!dateRange) return false;
        try {
            const [startStr, endStr] = dateRange.split('-').map(s => s.trim());
            const [sDay, sMonth] = startStr.split('.').map(Number);
            const [eDay, eMonth] = endStr.split('.').map(Number);

            const now = new Date();
            const currentYear = now.getFullYear();

            const start = new Date(currentYear, sMonth - 1, sDay);
            const end = new Date(currentYear, eMonth - 1, eDay);
            end.setHours(23, 59, 59); // End of day

            // Handle year wrap if needed
            return now >= start && now <= end;
        } catch (e) {
            return false;
        }
    };

    // Determine initial active week
    const initialWeek = useMemo(() => {
        const foundIndex = weeks.findIndex(w => isWeekActive(w.dateRange));
        // If current date match found, use it. obtain index in REVERSED array.
        // If not found, default to 0 (which is now the LATEST week because we reversed it).
        return foundIndex !== -1 ? foundIndex : 0;
    }, [weeks]);

    const [activeWeek, setActiveWeek] = useState(initialWeek);
    const [openDay, setOpenDay] = useState(-1);

    const currentWeek = weeks[activeWeek];

    // Get history for a specific exercise
    // Get history for a specific exercise
    const getExerciseHistory = (exerciseName) => {
        if (!exerciseName) return [];
        const history = [];
        weeks.forEach((week, wIndex) => {
            // Since weeks are REVERSED (Newest = Index 0), past weeks have HIGHER indices.
            // We want to show history relevant to the *currently viewed* week (activeWeek).
            // So we include weeks where wIndex >= activeWeek.
            if (wIndex < activeWeek) return; // Skip "future" weeks relative to the viewed week

            week.days.forEach(day => {
                const exercise = day.exercises.find(ex => ex.name === exerciseName);
                if (exercise && exercise.actualWeight && exercise.actualReps) {
                    history.push({
                        week: week.name || `Week ${weeks.length - wIndex}`, // Calculate real week number if needed
                        date: week.dateRange,
                        weight: exercise.actualWeight,
                        reps: exercise.actualReps,
                        sets: exercise.actualSets,
                        volume: (parseFloat(exercise.actualWeight) || 0) * (parseFloat(exercise.actualReps) || 0) * (parseFloat(exercise.actualSets) || 1)
                    });
                }
            });
        });
        return history; // Already in Newest -> Oldest order roughly, or sort by week ID? 
        // weeks array is Newest (Index 0) -> Oldest. So iteration produces Newest -> Oldest.
    };

    const getTrend = (exerciseName) => {
        const history = getExerciseHistory(exerciseName);
        if (history.length < 2) return null;

        const current = history[0];
        const previous = history[1];

        const wCur = parseFloat(current.weight) || 0;
        const wPrev = parseFloat(previous.weight) || 0;
        const rCur = parseFloat(current.reps) || 0;
        const rPrev = parseFloat(previous.reps) || 0;

        if (wCur > wPrev) return { dir: 'up', text: 'מגמת עלייה (משקל)' };
        if (wCur < wPrev) return { dir: 'down', text: 'ירידה במשקל' };

        if (rCur > rPrev) return { dir: 'up', text: 'מגמת עלייה (חזרות)' };
        if (rCur < rPrev) return { dir: 'down', text: 'ירידה בחזרות' };

        return { dir: 'same', text: 'ללא שינוי' };
    };

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

                            <a
                                href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=אימון והשקעה בעצמי :)&details=זמן לתת עבודה!&sf=true&output=xml"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="calendar-btn"
                            >
                                📅 שריון אימון ביומן
                            </a>
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
                                getHistory={getExerciseHistory}
                                getTrend={getTrend}
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
                        width: 85px;
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
                    .calendar-btn {
                        display: inline-block;
                        margin-top: 10px;
                        padding: 8px 12px;
                        background: rgba(255,255,255,0.1);
                        border: 1px solid #444;
                        border-radius: 8px;
                        color: #fff;
                        text-decoration: none;
                        font-size: 0.9rem;
                        transition: background 0.2s;
                    }
                    .calendar-btn:hover {
                        background: rgba(255,255,255,0.2);
                        border-color: #fff;
                    }
                `}</style>
            </main>
        </AuthGate>
    );
}
