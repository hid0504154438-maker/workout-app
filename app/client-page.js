'use client';

import { useState, useMemo, useEffect } from 'react';
import WeekTabs from '../components/WeekTabs';
import DayView from '../components/DayView';
import ProgressBar from '../components/ProgressBar';
import AuthGate from '../components/AuthGate';
import WorkoutHighModal from '../components/WorkoutHighModal';
import WeeklySummary from '../components/WeeklySummary';
import SmartGreeting from '../components/SmartGreeting';
import { triggerFireworks } from '../components/Confetti';
import { useEngagement } from '../hooks/useEngagement';

export default function ClientHome({ weeks: initialWeeks, userSlug }) {
    // Reverse weeks so the latest is first (User Request)
    // Reverse weeks so the latest is first, with safety check
    const weeks = useMemo(() => Array.isArray(initialWeeks) ? [...initialWeeks].reverse() : [], [initialWeeks]);


    // Helper: Parse date range "DD.MM - DD.MM"
    const isWeekActive = (dateRange) => {
        if (!dateRange || typeof dateRange !== 'string') return false;
        try {
            const parts = dateRange.split('-');
            if (parts.length !== 2) return false;
            const [startStr, endStr] = parts.map(s => s.trim());
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

    const { greeting } = useEngagement(weeks);

    // Calculate Weekly Progress
    const weekStats = useMemo(() => {
        if (!currentWeek) return { total: 0, completed: 0 };
        let total = 0;
        let completed = 0;

        currentWeek.days.forEach(day => {
            day.exercises.forEach(ex => {
                // Only count exercises that have a target 'sets' value (ignores headers/notes)
                if (ex.sets && String(ex.sets).trim().length > 0) {
                    total++;
                    if (ex.actualSets && String(ex.actualSets).trim().length > 0) {
                        completed++;
                    }
                }
            });
        });
        return { total, completed };
    }, [currentWeek]);

    const [showSummary, setShowSummary] = useState(false);

    useEffect(() => {
        if (weekStats.total > 0 && weekStats.completed === weekStats.total) {
            const key = `celebrated-week-summary-${activeWeek}-${userSlug}`;
            const hasCelebrated = localStorage.getItem(key);
            if (!hasCelebrated) {
                // Delay slightly to let the last checkmark animation finish
                setTimeout(() => {
                    setShowSummary(true);
                    localStorage.setItem(key, 'true');
                }, 1000);
            }
        }
    }, [weekStats, activeWeek, userSlug]);

    const [showWorkoutModal, setShowWorkoutModal] = useState(false);
    const [completedDay, setCompletedDay] = useState(null);

    const handleWorkoutComplete = (day) => {
        setCompletedDay(day);
        setShowWorkoutModal(true);
        // Also trigger fireworks!
        triggerFireworks();
    };

    return (
        <AuthGate userSlug={userSlug}>
            <main className="main-layout">
                {showSummary && (
                    <WeeklySummary
                        week={currentWeek}
                        stats={weekStats}
                        onClose={() => setShowSummary(false)}
                    />
                )}

                {showWorkoutModal && completedDay && (
                    <WorkoutHighModal
                        day={completedDay}
                        onClose={() => setShowWorkoutModal(false)}
                    />
                )}

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
                        <div className="greeting-wrapper">
                            <SmartGreeting greeting={greeting} userSlug={userSlug} />

                            <a
                                href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=אימון והשקעה בעצמי :)&details=זמן לתת עבודה!&sf=true&output=xml"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="calendar-btn"
                            >
                                📅 שריון אימון
                            </a>
                        </div>

                        <div className="card progress-card glass-card">
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
                                onWorkoutComplete={handleWorkoutComplete}
                            />
                        ))}

                        {!currentWeek && <div style={{ textAlign: 'center', padding: '2rem' }}>No workouts found.</div>}
                    </div>
                </div>

                <style jsx>{`
                    .main-layout {
                        display: flex;
                        flex-direction: row;
                        height: 100vh;
                        overflow: hidden;
                        background: radial-gradient(circle at 10% 20%, rgba(34, 211, 238, 0.05), transparent 40%);
                    }
                    .side-nav {
                        width: 85px;
                        background: var(--bg-dark);
                        border-left: var(--glass-border);
                        overflow-y: auto;
                        flex-shrink: 0;
                        backdrop-filter: blur(10px);
                    }
                    .content-area {
                        flex-grow: 1;
                        overflow-y: auto;
                        padding: 20px;
                        padding-bottom: 100px;
                    }
                    .dashboard-header {
                        margin-bottom: 25px;
                        animation: fadeIn 0.5s ease-out;
                    }
                    .greeting h1 {
                        font-size: 1.8rem;
                        margin: 0 0 5px 0;
                        font-weight: 700;
                        background: linear-gradient(to right, #fff, #cbd5e1);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .subtitle {
                        color: var(--accent);
                        font-size: 0.9rem;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        display: block;
                        margin-bottom: 15px;
                        font-weight: 600;
                    }
                    .progress-card {
                        padding: 15px;
                        border-radius: 16px;
                    }
                    .calendar-btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        margin-top: 10px;
                        padding: 10px 16px;
                        background: rgba(255,255,255,0.05);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 12px;
                        color: #fff;
                        text-decoration: none;
                        font-size: 0.9rem;
                        font-weight: 500;
                        transition: all 0.2s;
                    }
                    .calendar-btn:hover {
                        background: rgba(255,255,255,0.1);
                        border-color: var(--accent);
                        transform: translateY(-1px);
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </main>
        </AuthGate>
    );
}
