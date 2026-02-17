'use client';

import { useState, useEffect, useRef } from 'react';
import { getVideoId } from '../lib/videoMapping';
import { extractVideoLink, getSearchUrl } from '../lib/utils';
import VideoModal from './VideoModal';
import { triggerMiniConfetti } from './Confetti';

export default function DayView({ day, isOpen, onToggle, userSlug, getHistory, getTrend }) {
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
                    sheetName: 'סייקל 7', // Note: This should ideally be dynamic based on the trainee, but for now matches the parser output structure.
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

                                        if (manualLink) {
                                            return (
                                                <a href={manualLink} target="_blank" rel="noopener noreferrer" className="video-btn">
                                                    🎬
                                                </a>
                                            );
                                        }

                                        if (mappedId) {
                                            return (
                                                <button
                                                    className="video-btn"
                                                    onClick={() => setActiveVideo(mappedId)}
                                                >
                                                    ▶️
                                                </button>
                                            );
                                        }

                                        return (
                                            <a
                                                href={getSearchUrl(ex.name)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="video-btn search-btn"
                                                style={{ opacity: 0.5, filter: 'grayscale(1)' }}
                                            >
                                                🔍
                                            </a>
                                        );
                                    })()}
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
                                    {ex.rest && (
                                        <div className="plan-metric">
                                            <span className="label">מנוחה</span>
                                            <span className="value">{ex.rest}</span>
                                        </div>
                                    )}
                                    {ex.rpe && (
                                        <div className="plan-metric">
                                            <span className="label">RPE</span>
                                            <span className="value">{ex.rpe}</span>
                                        </div>
                                    )}
                                </div>

                                {notesWithoutLink && <div className="notes-text">{notesWithoutLink}</div>}

                                {/* Inputs */}
                                <div className="inputs-row">
                                    {['actualSets', 'actualReps', 'actualWeight'].map((field) => {
                                        const status = savingState[`${ex.rowIndex}-${field}`];
                                        const labels = { actualSets: 'סטים', actualReps: 'חזרות', actualWeight: 'משקל' };
                                        const isWeight = field === 'actualWeight';

                                        return (
                                            <div key={field} className="input-wrapper">
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    pattern="[0-9]*"
                                                    value={ex[field] || ''}
                                                    placeholder={labels[field]}
                                                    onChange={(e) => handleInputChange(exIndex, field, e.target.value)}
                                                    className={status === 'saved' ? 'saved' : ''}
                                                />
                                                {status === 'saved' && <span className="status-dot success"></span>}
                                                {status === 'saving' && <span className="status-dot saving"></span>}

                                                {/* PR Badge */}
                                                {isWeight && isPR && (
                                                    <span className="pr-badge" title="New Personal Record!">🏆</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {activeVideo && (
                <VideoModal videoId={activeVideo} onClose={() => setActiveVideo(null)} />
            )}

            <style jsx>{`
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
                color: #fff;
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
                background: rgba(0,0,0,0.2);
                padding: 4px 10px;
                border-radius: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-width: 55px;
                border: 1px solid rgba(255,255,255,0.05);
            }
            .mini-bar-track {
                width: 100%;
                height: 3px;
                background: rgba(255,255,255,0.1);
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
                border-top: 1px solid rgba(255,255,255,0.05);
                animation: slideDown 0.3s ease-out;
            }
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .exercise-item {
                padding: 1.4rem 0;
                border-bottom: 1px solid rgba(255,255,255,0.05);
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
                background: rgba(255,255,255,0.08);
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
                background: rgba(239, 68, 68, 0.1);
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 12px;
                border: 1px solid rgba(239, 68, 68, 0.2);
                color: #ef4444;
                transition: all 0.2s;
            }
            .video-btn:hover {
                transform: scale(1.05);
                background: rgba(239, 68, 68, 0.2);
                box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
            }

            .exercise-info {
                display: flex;
                gap: 24px;
                margin-bottom: 20px;
                background: rgba(0,0,0,0.2);
                padding: 12px 16px;
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.03);
            }
            .plan-metric {
                display: flex;
                flex-direction: column;
            }
            .plan-metric .label { font-size: 0.7rem; color: var(--text-muted); margin-bottom: 4px; uppercase; }
            .plan-metric .value { font-size: 1.1rem; font-weight: 600; color: #fff; }

            .notes-text {
                font-size: 0.9rem;
                color: #d1d5db;
                margin-bottom: 20px;
                background: rgba(34, 211, 238, 0.05);
                padding: 12px;
                border-radius: 8px;
                border-right: 3px solid var(--accent);
                line-height: 1.5;
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
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.1);
                color: #fff;
                padding: 16px 5px;
                border-radius: 12px;
                text-align: center;
                font-size: 1.1rem;
                font-weight: 500;
                transition: all 0.2s;
            }
            .input-wrapper input:focus {
                outline: none;
                border-color: var(--accent);
                background: rgba(0,0,0,0.5);
                box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2);
            }
            .input-wrapper input::placeholder { color: rgba(255,255,255,0.2); font-size: 0.9rem; }
            .input-wrapper input.saved {
                border-color: #22c55e;
                background: rgba(34, 197, 94, 0.1);
                color: #22c55e;
            }
            .status-dot {
                position: absolute;
                top: 10px;
                left: 10px;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                box-shadow: 0 0 5px currentColor;
            }
            .status-dot.success { background: #22c55e; color: #22c55e; }
            .status-dot.saving { background: #eab308; color: #eab308; }

            .history-btn {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1.2rem;
                padding: 0;
                margin-right: 5px;
                opacity: 0.8;
                transition: opacity 0.2s;
            }
            .history-btn:hover { opacity: 1; }
            
            .history-panel {
                background: rgba(0,0,0,0.3);
                padding: 12px;
                border-radius: 12px;
                margin-bottom: 20px;
                border: 1px solid rgba(255,255,255,0.05);
            }
            .history-panel h4 { margin: 0 0 10px 0; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
            .history-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255,255,255,0.05);
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
