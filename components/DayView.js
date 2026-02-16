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

    return (
        <div className="day-card">
            <button className={`day-header ${isOpen ? 'open' : ''}`} onClick={onToggle}>
                <h3>{day.name}</h3>
                <span className="arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="exercises-list">
                    {exercises.map((ex, exIndex) => {
                        const videoLink = extractVideoLink(ex.notes);
                        const notesWithoutLink = ex.notes ? ex.notes.replace(videoLink, '').trim() : '';

                        return (
                            <div key={exIndex} className="exercise-item">
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
            margin-bottom: 10px;
            border: 1px solid #333;
            overflow: hidden;
        }
        .day-header {
            width: 100%;
            background: none;
            border: none;
            color: #fff;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            text-align: right;
        }
        .day-header h3 { margin: 0; font-size: 1.1rem; }
        .arrow { color: var(--accent); }
        
        .exercises-list {
            padding: 0 1rem 1rem 1rem;
            border-top: 1px solid #333;
        }
        .exercise-item {
            padding: 1rem 0;
            border-bottom: 1px solid #2a2a2a;
        }
        .exercise-item:last-child { border-bottom: none; }

        .exercise-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }
        .tag-type {
            font-size: 0.7em;
            background: #333;
            padding: 2px 6px;
            border-radius: 4px;
            margin-left: 6px;
            color: var(--accent-secondary);
            vertical-align: middle;
        }
        .video-btn {
            font-size: 1.2rem;
            text-decoration: none;
            background: #222;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            border: 1px solid #444;
        }

        .exercise-info {
            display: flex;
            gap: 15px;
            margin-bottom: 10px;
            background: #222;
            padding: 8px;
            border-radius: 8px;
        }
        .plan-metric {
            display: flex;
            flex-direction: column;
        }
        .plan-metric .label { font-size: 0.65em; color: #888; }
        .plan-metric .value { font-size: 0.9em; font-weight: bold; }

        .notes-text {
            font-size: 0.85em;
            color: #aaa;
            margin-bottom: 10px;
            background: #222;
            padding: 6px;
            border-radius: 4px;
            border-right: 2px solid var(--accent);
        }

        .inputs-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
        }
        .input-wrapper {
            position: relative;
        }
        .input-wrapper input {
            width: 100%;
            background: #111;
            border: 1px solid #444;
            color: #fff;
            padding: 12px 5px;
            border-radius: 8px;
            text-align: center;
            font-size: 1rem; 
        }
        .input-wrapper input:focus {
            outline: none;
            border-color: var(--accent);
            background: #000;
        }
        .input-wrapper input.saved {
            border-color: #22c55e;
        }
        .status-dot {
            position: absolute;
            top: 6px;
            left: 6px;
            width: 6px;
            height: 6px;
            border-radius: 50%;
        }
        .status-dot.success { background: #22c55e; }
        .status-dot.saving { background: #eab308; }
      `}</style>
        </div>
    );
}
