'use client';

import { useState, useEffect } from 'react';
import { getEquivalentObject } from '../lib/heavyObjects';
import confetti from 'canvas-confetti';

export default function WorkoutHighModal({ day, onClose }) {
    const [stats, setStats] = useState(null);
    const [equivalent, setEquivalent] = useState(null);

    useEffect(() => {
        // Calculate total volume safely
        let totalVolume = 0;
        let prCount = 0; // Simulation of PRs for now, in real app compare to history

        day.exercises.forEach(ex => {
            const weight = parseFloat(ex.actualWeight || ex.weight || 0);
            const reps = parseInt(ex.actualReps || ex.reps || 0);
            const sets = parseInt(ex.actualSets || ex.sets || 0);
            totalVolume += weight * reps * sets;

            // Random PR simulation for "Emotional UX" request if no history available yet
            if (ex.actualWeight && parseFloat(ex.actualWeight) > parseFloat(ex.weight)) {
                prCount++;
            }
        });

        const obj = getEquivalentObject(totalVolume);
        setStats({ totalVolume, prCount });
        setEquivalent(obj);

        // Gold Confetti
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#FFD700', '#FFA500', '#ffffff'] // Gold/White
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#FFD700', '#FFA500', '#ffffff']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());

    }, [day]);

    if (!stats || !equivalent) return null;

    const shareToWhatsapp = () => {
        const text = `סיימתי אימון ${day.name}! 🔥\nהזזתי היום ${stats.totalVolume.toLocaleString()} ק"ג (${equivalent.name})!\nשברתי ${stats.prCount} שיאים אישיים. 💪\n\n- נשלח מהאפליקציה של ישראל`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-gold">
                <button className="close-btn" onClick={onClose}>✕</button>

                <div className="trophy-icon">🏆</div>

                <h2 className="title">אימון פגז!</h2>
                <p className="subtitle">נתת עבודה היום, כל הכבוד.</p>

                <div className="stats-grid">
                    <div className="stat-box">
                        <span className="stat-label">נפח כולל</span>
                        <span className="stat-value gold-text">{stats.totalVolume.toLocaleString()} <small>ק"ג</small></span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">שיאים שנשברו</span>
                        <span className="stat-value blue-text">{stats.prCount > 0 ? stats.prCount : 'התמדה!'}</span>
                    </div>
                </div>

                <div className="fun-fact">
                    <span className="emoji">{equivalent.emoji}</span>
                    <p>זה כמו להרים <strong>{equivalent.count} {equivalent.name}</strong>!</p>
                </div>

                <div className="actions">
                    <button className="share-btn whatsapp" onClick={shareToWhatsapp}>
                        שתף עם המאמן 💬
                    </button>
                    <button className="close-action-btn" onClick={onClose}>
                        סגור
                    </button>
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease;
                    padding: 20px;
                }

                .glass-gold {
                    background: linear-gradient(145deg, #1a1a1a, #0f0f0f);
                    border: 1px solid rgba(255, 215, 0, 0.2); /* Gold border */
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.15);
                    border-radius: 24px;
                    padding: 30px;
                    width: 100%;
                    max-width: 360px;
                    text-align: center;
                    position: relative;
                    animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .trophy-icon {
                    font-size: 4rem;
                    margin-bottom: 10px;
                    filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.6));
                    animation: bounce 2s infinite;
                }

                .title {
                    font-size: 2rem;
                    font-weight: 800;
                    background: linear-gradient(to right, #FFD700, #FDB931);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0 0 5px 0;
                }

                .subtitle {
                    color: #a1a1aa;
                    font-size: 1rem;
                    margin-bottom: 25px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 25px;
                }

                .stat-box {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 15px;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .stat-box:first-child { border-bottom: 2px solid rgba(255, 215, 0, 0.3); }
                .stat-box:last-child { border-bottom: 2px solid rgba(59, 130, 246, 0.5); }

                .stat-label { font-size: 0.8rem; color: #71717a; margin-bottom: 5px; }
                .stat-value { font-size: 1.4rem; font-weight: 700; }
                
                .gold-text { color: #FFD700; }
                .blue-text { color: #60a5fa; }

                .fun-fact {
                    background: rgba(255, 255, 255, 0.03);
                    padding: 15px;
                    border-radius: 16px;
                    margin-bottom: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                .emoji { font-size: 1.5rem; }
                .fun-fact p { margin: 0; color: #d4d4d8; font-size: 0.95rem; }

                .actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .share-btn {
                    background: #25D366; /* WhatsApp Green */
                    color: white;
                    border: none;
                    padding: 14px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: transform 0.2s;
                    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
                }
                .close-action-btn {
                    background: transparent;
                    color: #71717a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 12px;
                    border-radius: 12px;
                    cursor: pointer;
                }

                .share-btn:active { transform: scale(0.98); }
                
                .close-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: none;
                    border: none;
                    color: #52525b;
                    font-size: 1.2rem;
                    cursor: pointer;
                }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            `}</style>
        </div>
    );
}
