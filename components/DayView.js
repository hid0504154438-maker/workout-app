'use client';

import { useState, useEffect, useRef } from 'react';

// Helper to find links in text
const extractVideoLink = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
};

export default function DayView({ day, weekIndex, dayIndex, isOpen, onToggle, userSlug }) {
    const [exercises, setExercises] = useState(day.exercises);
    const [savingState, setSavingState] = useState({});
    const timeoutRefs = useRef({});

    useEffect(() => {
        setExercises(day.exercises);
    }, [day.exercises]);

    const updateCell = async (rowIndex, field, value) => {
        const key = `${rowIndex}-${field}`;
        setSavingState(prev => ({ ...prev, [key]: 'saving' }));

        try {
            const res = await fetch('/api/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userSlug, // Identifies who is updating
                    sheetName: 'סייקל 7', // TODO: Make this dynamic from config too if needed? Assuming activeTab is sufficient context usually, but here we pass sheetName. Wait, the API relies on trainees[userSlug].activeTab? NO.
                    // The API code I wrote uses `sheetName` from body.
                    // But the `trainees.js` has `activeTab`.
                    // Currently DayView hardcodes 'סייקל 7'. This is a BUG if distinct users have distinct tab names.
                    // We should pass the sheetName via props or let the server decide based on activeTab.
                    // For now, let's keep sending sheetName but we need to receive it in props if it differs.
                    // Actually, `processSheetData` doesn't return the sheet name in the data structure.
                    // Let's modify the API to use `traineer.activeTab`.
                    rowIndex,
                    field,
                    value
                }),
            });
            if (!res.ok) throw new Error('Failed');
            setSavingState(prev => ({ ...prev, [key]: 'saved' }));
            setTimeout(() => {
                setSavingState(prev => {
                    const newState = { ...prev };
                    delete newState[key];
                    return newState;
                });
            }, 2000);
        } catch (err) {
            console.error(err);
            setSavingState(prev => ({ ...prev, [key]: 'error' }));
        }
    };

    const handleInputChange = (exIndex, field, value) => {
        const newExercises = [...exercises];
        newExercises[exIndex][field] = value;
        setExercises(newExercises);

        // Debounce
        const ex = exercises[exIndex];
        if (!ex.rowIndex) return;
        const key = `${ex.rowIndex}-${field}`;
        if (timeoutRefs.current[key]) clearTimeout(timeoutRefs.current[key]);
        timeoutRefs.current[key] = setTimeout(() => {
            updateCell(ex.rowIndex, field, value);
        }, 1000);
    };

    const completedCount = exercises.filter(ex => ex.actualSets && ex.actualSets.trim() !== '').length;
    const totalCount = exercises.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const isDayComplete = totalCount > 0 && completedCount === totalCount;

    return (
        <div className={`day-card ${isDayComplete ? 'complete-day' : ''}`}>
            <button className={`day-header ${isOpen ? 'open' : ''}`} onClick={onToggle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3>{day.name}</h3>
                    {totalCount > 0 && (
                        <span className="mini-progress">
                            {completedCount}/{totalCount}
                            <div className="mini-bar-track">
                                <div className="mini-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        </span>
                    )}
                </div>
                <span className="arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="exercises-list">
                    {exercises.map((ex, exIndex) => {
                        const videoLink = extractVideoLink(ex.notes);
                        const notesWithoutLink = ex.notes ? ex.notes.replace(videoLink, '').trim() : '';
                        const isExerciseDone = ex.actualSets && ex.actualSets.trim() !== '';

                        return (
                            <div key={exIndex} className={`exercise-item ${isExerciseDone ? 'done' : ''}`}>
                                <div className="exercise-top">
                                    <div className="exercise-title">
                                        {ex.type && <span className="tag-type">{ex.type}</span>}
                                        <strong>{ex.name || '---'}</strong>
                                    </div>
                                    {videoLink && (
                                        <a href={videoLink} target="_blank" rel="noopener noreferrer" className="video-btn">
                                            🎬
                                        </a>
                                    )}
                                </div>

                                <div className="exercise-info">
                                    <div className="plan-metric">
                                        <span className="label">סטים</span>
                                        <span className="value">{ex.sets}</span>
                                    </div>
                                    <div className="plan-metric">
                                        <span className="label">חזרות</span>
                                        <span className="value">{ex.reps}</span>
                                    </div>
                                    <div className="plan-metric">
                                        <span className="label">משקל יעד</span>
                                        <span className="value">{ex.weight || '-'}</span>
                                    </div>
                                </div>

                                {notesWithoutLink && <div className="notes-text">{notesWithoutLink}</div>}

                                {/* Inputs */}
                                <div className="inputs-row">
                                    {['actualSets', 'actualReps', 'actualWeight'].map((field) => {
                                        const status = savingState[`${ex.rowIndex}-${field}`];
                                        const labels = { actualSets: 'סטים', actualReps: 'חזרות', actualWeight: 'משקל' };
                                        return (
                                            <div key={field} className="input-wrapper">
                                                <input
                                                    type="tel" // optimized for numbers
                                                    value={ex[field] || ''}
                                                    placeholder={labels[field]} // use label as placeholder to save space
                                                    onChange={(e) => handleInputChange(exIndex, field, e.target.value)}
                                                    className={status === 'saved' ? 'saved' : ''}
                                                />
                                                {status === 'saved' && <span className="status-dot success"></span>}
                                                {status === 'saving' && <span className="status-dot saving"></span>}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <style jsx>{`
        .day-card {
            background: var(--card-bg);
            border-radius: 12px;
            margin-bottom: 12px;
            border: 1px solid #333;
            overflow: hidden;
            transition: border-color 0.3s ease;
        }
        .day-card.complete-day {
            border-color: var(--accent);
            box-shadow: 0 0 10px rgba(0, 255, 157, 0.1);
        }
        .day-header {
            width: 100%;
            background: none;
            border: none;
            color: #fff;
            padding: 1.2rem; /* Larger touch area */
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            text-align: right;
        }
        .day-header h3 { margin: 0; font-size: 1.2rem; }
        .arrow { color: var(--accent); font-size: 1.2rem; }
        
        .mini-progress {
            font-size: 0.8rem;
            color: #888;
            background: rgba(255,255,255,0.05);
            padding: 4px 8px;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 50px;
        }
        .mini-bar-track {
            width: 100%;
            height: 3px;
            background: #444;
            margin-top: 3px;
            border-radius: 2px;
        }
        .mini-bar-fill {
            height: 100%;
            background: var(--accent);
            border-radius: 2px;
            transition: width 0.3s ease;
        }

        .exercises-list {
            padding: 0 1rem 1rem 1rem;
            border-top: 1px solid #333;
        }
        .exercise-item {
            padding: 1.2rem 0; /* More spacing */
            border-bottom: 1px solid #2a2a2a;
            transition: background 0.3s;
        }
        .exercise-item.done {
            /* Optional: subtle highlight for done exercises */
            background: linear-gradient(to left, rgba(0, 255, 157, 0.03), transparent);
            border-right: 2px solid var(--accent);
            padding-right: 10px;
            margin-right: -10px; /* Compensate padding */
        }
        .exercise-item:last-child { border-bottom: none; }

        .exercise-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
        }
        .tag-type {
            font-size: 0.7em;
            background: #333;
            padding: 3px 8px;
            border-radius: 6px;
            margin-left: 8px;
            color: var(--accent-secondary);
            vertical-align: middle;
        }
        .video-btn {
            font-size: 1.4rem;
            text-decoration: none;
            background: rgba(255, 0, 0, 0.15); /* Red tint for YouTube */
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px; /* Rounded square instead of circle */
            border: 1px solid rgba(255, 0, 0, 0.3);
            color: #f00;
        }

        .exercise-info {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
            background: #222;
            padding: 10px;
            border-radius: 8px;
        }
        .plan-metric {
            display: flex;
            flex-direction: column;
        }
        .plan-metric .label { font-size: 0.7em; color: #888; margin-bottom: 2px; }
        .plan-metric .value { font-size: 1rem; font-weight: bold; }

        .notes-text {
            font-size: 0.9em;
            color: #aaa;
            margin-bottom: 15px;
            background: #222;
            padding: 10px;
            border-radius: 6px;
            border-right: 3px solid var(--accent);
            line-height: 1.4;
        }

        .inputs-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
        }
        .input-wrapper {
            position: relative;
        }
        .input-wrapper input {
            width: 100%;
            background: #111;
            border: 1px solid #444;
            color: #fff;
            padding: 14px 5px; /* Taller input */
            border-radius: 10px;
            text-align: center;
            font-size: 16px; /* Prevents iOS zoom */
        }
        .input-wrapper input:focus {
            outline: none;
            border-color: var(--accent);
            background: #000;
        }
        .input-wrapper input.saved {
            border-color: #22c55e;
            background: rgba(34, 197, 94, 0.1);
        }
        .status-dot {
            position: absolute;
            top: 8px;
            left: 8px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        .status-dot.success { background: #22c55e; }
        .status-dot.saving { background: #eab308; }
      `}</style>
        </div>
    );
}
