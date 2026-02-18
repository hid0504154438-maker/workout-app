'use client';

import { useState, useEffect, useRef } from 'react';
import { getVideoId } from '../lib/videoMapping';
import { extractVideoLink } from '../lib/utils';
import VideoModal from './VideoModal';
import { triggerMiniConfetti } from './Confetti';
import ExerciseInput from './ExerciseInput';

export default function DayView({ day, isOpen, onToggle, userSlug, getHistory, getTrend, onWorkoutComplete }) {
    const [exercises, setExercises] = useState(day.exercises);
    const [savingState, setSavingState] = useState({});
    const [historyOpen, setHistoryOpen] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);
    const [prState, setPrState] = useState({}); // Tracks PRs per exercise index
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
                    userSlug,
                    sheetName: day.sheetName || 'סייקל 7', // Fallback if not provided, though parser should provide it.
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

    const checkPR = (name, weight, exIndex) => {
        if (!getHistory || !weight) return;
        const history = getHistory(name);
        if (!history || history.length === 0) return;

        const maxWeight = Math.max(...history.map(h => parseFloat(h.weight) || 0));
        const currentWeight = parseFloat(weight);

        if (currentWeight > maxWeight && !prState[exIndex]) {
            setPrState(prev => ({ ...prev, [exIndex]: true }));
            triggerMiniConfetti();
        } else if (currentWeight <= maxWeight && prState[exIndex]) {
            setPrState(prev => {
                const newState = { ...prev };
                delete newState[exIndex];
                return newState;
            });
        }
    };

    const handleInputChange = (exIndex, field, value) => {
        const newExercises = [...exercises];
        newExercises[exIndex][field] = value;
        setExercises(newExercises);

        // Check for PR if weight is updated
        if (field === 'actualWeight') {
            checkPR(newExercises[exIndex].name, value, exIndex);
        }

        // Debounce
        const ex = exercises[exIndex];
        if (!ex.rowIndex) return;
        const key = `${ex.rowIndex}-${field}`;
        if (timeoutRefs.current[key]) clearTimeout(timeoutRefs.current[key]);
        timeoutRefs.current[key] = setTimeout(() => {
            updateCell(ex.rowIndex, field, value);
        }, 1000);
    };

    const completedCount = exercises.filter(ex => ex.actualSets && String(ex.actualSets).trim().length > 0).length;
    const totalCount = exercises.filter(ex => ex.sets && String(ex.sets).trim().length > 0).length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const isDayComplete = totalCount > 0 && completedCount === totalCount;

    // 80% Celebration Logic & 100% Completion Trigger
    useEffect(() => {
        // 80% Celebration
        if (progressPercent >= 80) {
            const key = `celebrated-80-${day.name}-${userSlug}-${new Date().toLocaleDateString()}`;
            const alreadyCelebrated = localStorage.getItem(key);

            if (!alreadyCelebrated) {
                import('./Confetti').then(mod => mod.triggerFireworks());

                // Show toast (simple implementation)
                const toast = document.createElement('div');
                toast.innerText = 'התקדמת עוד צעד לחיים בריאים והמטרה שלך! 💪';
                Object.assign(toast.style, {
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(34, 197, 94, 0.9)',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    zIndex: '10000',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(10px)',
                    animation: 'slideInToast 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                });

                // Add keyframes style if not exists
                if (!document.getElementById('toast-style')) {
                    const style = document.createElement('style');
                    style.id = 'toast-style';
                    style.innerHTML = `
                        @keyframes slideInToast {
                            from { transform: translate(-50%, -100%); opacity: 0; }
                            to { transform: translate(-50%, 0); opacity: 1; }
                        }
                    `;
                    document.head.appendChild(style);
                }

                document.body.appendChild(toast);
                localStorage.setItem(key, 'true');

                setTimeout(() => {
                    toast.style.transition = 'opacity 0.5s';
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 500);
                }, 4000);
            }
        }

        // 100% Completion Trigger for Modal
        if (progressPercent === 100 && onWorkoutComplete) {
            const key = `celebrated-100-${day.name}-${userSlug}-${new Date().toLocaleDateString()}`;
            const alreadyShown = localStorage.getItem(key);
            if (!alreadyShown) {
                // Trigger parent handler
                onWorkoutComplete(day);
                localStorage.setItem(key, 'true');
            }
        }

    }, [progressPercent, day.name, userSlug, onWorkoutComplete]);

    const cleanInstructions = (text) => {
        if (!text) return '';
        return text.replace(/\[Search:.*?\]/g, '').trim();
    };

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
                        const isExerciseDone = ex.actualSets && String(ex.actualSets).trim().length > 0;
                        const isPR = prState[exIndex];

                        return (
                            <div key={exIndex} className={`exercise-item ${isExerciseDone ? 'done' : ''}`}>
                                <div className="exercise-top">
                                    <div className="exercise-title">
                                        {ex.type && <span className="tag-type">{ex.type}</span>}
                                        <strong>{ex.name || '---'}</strong>

                                        {/* History Toggle */}
                                        {getHistory && getHistory(ex.name).length > 0 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                <button
                                                    className="history-btn"
                                                    onClick={() => {
                                                        const isOpen = historyOpen === exIndex;
                                                        setHistoryOpen(isOpen ? null : exIndex);
                                                    }}
                                                >
                                                    📈
                                                </button>
                                                {getTrend && (() => {
                                                    const trend = getTrend(ex.name);
                                                    if (!trend) return null;
                                                    const color = trend.dir === 'up' ? '#22c55e' : trend.dir === 'down' ? '#ef4444' : '#888';
                                                    const arrow = trend.dir === 'up' ? '▲' : trend.dir === 'down' ? '▼' : '➖';
                                                    return (
                                                        <span style={{ fontSize: '0.75rem', color, fontWeight: 'bold' }}>
                                                            {arrow} {trend.text}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Video Button Logic */}
                                    {(() => {
                                        const manualLink = videoLink;
                                        const mappedId = getVideoId(ex.name);
                                        const customSearchMatch = ex.notes && ex.notes.match(/\[Search:\s*(.*?)\]/i);
                                        const searchTerm = customSearchMatch ? customSearchMatch[1] : ex.name;

                                        if (manualLink) {
                                            return (
                                                <a href={manualLink} target="_blank" rel="noopener noreferrer" className="video-btn">
                                                    ▶
                                                </a>
                                            );
                                        } else {
                                            return (
                                                <button
                                                    className="video-btn"
                                                    onClick={() => setActiveVideo(mappedId || searchTerm)}
                                                >
                                                    {mappedId ? '▶' : '🔍'}
                                                </button>
                                            );
                                        }
                                    })()}
                                </div>

                                {/* Stats Chips Row - Primary (Sets, Reps, Weight) */}
                                <div className="stats-row-primary">
                                    <div className="stat-chip">
                                        <span className="chip-label">סטים</span>
                                        <span className="chip-value">{ex.sets}</span>
                                    </div>
                                    <div className="stat-chip">
                                        <span className="chip-label">חזרות</span>
                                        <span className="chip-value">{ex.reps}</span>
                                    </div>
                                    <div className="stat-chip">
                                        <span className="chip-label">משקל</span>
                                        <span className="chip-value">{ex.weight}</span>
                                    </div>
                                </div>

                                {/* Stats Chips Row - Secondary (Rest, RPE) */}
                                {(ex.rest || ex.rpe) && (
                                    <div className="stats-row-secondary">
                                        {ex.rest && (
                                            <div className="stat-chip secondary">
                                                <span className="chip-label">מנוחה</span>
                                                <span className="chip-value">{ex.rest}</span>
                                            </div>
                                        )}
                                        {ex.rpe && (
                                            <div className="stat-chip secondary">
                                                <span className="chip-label">RPE</span>
                                                <span className="chip-value">{ex.rpe}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Inputs Grid - Optimistic & Touchable */}
                                <div className="inputs-grid">
                                    <ExerciseInput
                                        userSlug={userSlug}
                                        dayName={day.name}
                                        exerciseName={ex.name}
                                        field="actualSets"
                                        initialValue={ex.actualSets}
                                        label="סטים בפועל"
                                        placeholder={ex.sets}
                                        type="number"
                                    />
                                    <ExerciseInput
                                        userSlug={userSlug}
                                        dayName={day.name}
                                        exerciseName={ex.name}
                                        field="actualReps"
                                        initialValue={ex.actualReps}
                                        label="חזרות"
                                        placeholder={ex.reps}
                                        type="number"
                                    />
                                    <ExerciseInput
                                        userSlug={userSlug}
                                        dayName={day.name}
                                        exerciseName={ex.name}
                                        field="actualWeight"
                                        initialValue={ex.actualWeight}
                                        label={`משקל (${ex.weight})`}
                                        placeholder="ק״ג"
                                        type="number"
                                    />
                                </div>
                                <div className="notes-input-section">
                                    <ExerciseInput
                                        userSlug={userSlug}
                                        dayName={day.name}
                                        exerciseName={ex.name}
                                        field="notes"
                                        initialValue={ex.notes}
                                        label="הערות והארות ✏️"
                                        placeholder="רשום הערות לאימון..."
                                        type="text"
                                    />
                                </div>

                                {/* Notes / Instructions Toggle */}
                                <div className="exercise-footer">
                                    <details className="instructions-details">
                                        <summary>הנחיות ודגשים 💡</summary>
                                        <p className="clean-instructions">{cleanInstructions(ex.originalInstructions)}</p>
                                        <p className="original-notes">{notesWithoutLink}</p>
                                    </details>
                                </div>

                                {/* History Modal / Expansion */}
                                {historyOpen === exIndex && (
                                    <div className="history-panel">
                                        <h4>היסטוריית ביצועים</h4>
                                        <div className="history-list">
                                            {getHistory(ex.name).map((h, i) => (
                                                <div key={i} className="history-row">
                                                    <span className="h-date">שבוע {h.week}</span>
                                                    <span className="h-stats">
                                                        {h.weight}kg x {h.reps} ({h.sets} sets)
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {activeVideo && (
                <VideoModal videoId={activeVideo} onClose={() => setActiveVideo(null)} />
            )}

            <style jsx>{`
                .stats-row-primary {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 8px; /* Small gap between rows */
                }
                .stats-row-secondary {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px; /* Gap before inputs */
                }
                .stat-chip {
                    background: rgba(0,0,0,0.03); /* Changed for light mode */
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 4px 10px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-width: 50px;
                    flex: 1; /* Stretch to fill width */
                }
                .stat-chip.secondary {
                    background: rgba(0,0,0,0.015);
                    border-color: rgba(0,0,0,0.03);
                }
                .chip-label { font-size: 0.65rem; color: var(--text-muted); }
                .chip-value { font-size: 0.9rem; font-weight: 600; color: var(--text-main); }

                .inputs-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr; /* 3 columns for Sets, Reps, Weight */
                    gap: 12px;
                    margin-bottom: 12px;
                }
                .notes-input-section {
                    margin-top: 8px;
                    margin-bottom: 12px;
                }
                
                .exercise-footer {
                    margin-top: 10px;
                }
                .instructions-details summary {
                    color: var(--accent);
                    font-size: 0.85rem;
                    cursor: pointer;
                    list-style: none; /* Hide default triangle in some browsers */
                    margin-bottom: 5px;
                }
                .instructions-details[open] summary { margin-bottom: 10px; }
                .clean-instructions {
                    font-size: 0.9rem;
                    line-height: 1.5;
                    color: var(--text-muted);
                    background: rgba(0,0,0,0.03);
                    padding: 10px;
                    border-radius: 8px;
                }

                .day-card {
                    background: var(--bg-card);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: var(--glass-border);
                    box-shadow: var(--glass-shadow);
                    border-radius: 16px;
                    margin-bottom: 16px;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .day-card.complete-day {
                    border-color: var(--accent);
                    background: linear-gradient(145deg, rgba(34, 211, 238, 0.05), rgba(0, 0, 0, 0));
                }

                .day-header {
                    width: 100%;
                    background: transparent;
                    border: none;
                    color: var(--text-main);
                    padding: 1.4rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    text-align: right;
                }
                .day-header h3 { margin: 0; font-size: 1.1rem; font-weight: 600; letter-spacing: 0.5px; }
                .arrow { color: var(--text-muted); font-size: 1rem; transition: transform 0.3s; }
                .day-header.open .arrow { transform: rotate(180deg); color: var(--accent); }
                
                .mini-progress {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    background: rgba(0,0,0,0.05); /* Light mode */
                    padding: 4px 10px;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-width: 55px;
                    border: 1px solid var(--border-color);
                }
                .mini-bar-track {
                    width: 100%;
                    height: 3px;
                    background: rgba(0,0,0,0.1);
                    margin-top: 4px;
                    border-radius: 2px;
                    overflow: hidden;
                }
                .mini-bar-fill {
                    height: 100%;
                    background: var(--accent);
                    border-radius: 2px;
                    transition: width 0.3s ease;
                    box-shadow: 0 0 5px var(--accent-glow);
                }

                .exercises-list {
                    padding: 0 1.2rem 1.2rem 1.2rem;
                    border-top: 1px solid var(--border-color);
                    animation: slideDown 0.3s ease-out;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .exercise-item {
                    padding: 1.4rem 0;
                    border-bottom: 1px solid var(--border-color);
                }
                .exercise-item:last-child { border-bottom: none; }

                .exercise-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                }
                .tag-type {
                    font-size: 0.65rem;
                    background: rgba(0,0,0,0.05);
                    padding: 4px 8px;
                    border-radius: 6px;
                    margin-left: 10px;
                    color: var(--accent);
                    font-weight: 500;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    vertical-align: middle;
                }
                .video-btn {
                    font-size: 1.2rem;
                    text-decoration: none;
                    background: rgba(0,0,0,0.05);
                    color: var(--text-main);
                    width: 36px; height: 36px;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 50%;
                    transition: transform 0.2s;
                }
                .video-btn:active { transform: scale(0.9); }

                .history-panel {
                    margin-top: 16px;
                    background: rgba(0,0,0,0.03);
                    border-radius: 12px;
                    padding: 16px;
                }
                .history-panel h4 {
                    margin: 0 0 12px 0;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                .history-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .history-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid var(--border-color);
                    font-size: 0.9rem;
                }
                .history-row:last-child { border: none; }
                .h-stats { color: var(--accent); font-weight: 600; direction: ltr; font-family: monospace; }
                
                .pr-badge {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 1.2rem;
                    animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    filter: drop-shadow(0 0 5px gold);
                }
                @keyframes pop {
                    from { transform: translateY(-50%) scale(0); }
                    to { transform: translateY(-50%) scale(1); }
                }
            `}</style>
        </div>
    );
}
