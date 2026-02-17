'use client';

import { useEffect, useState } from 'react';
import { triggerFireworks } from './Confetti';

export default function WeeklySummary({ week, stats, onClose }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        triggerFireworks();
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300);
    };

    if (!week) return null;

    return (
        <div className={`summary-overlay ${visible ? 'visible' : ''}`}>
            <div className="summary-card">
                <div className="icon">🏆</div>
                <h2>שבוע {week.name} הושלם!</h2>
                <p className="subtitle">כל הכבוד, עמדת בכל היעדים השבוע.</p>

                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="value">{stats.total}</span>
                        <span className="label">תרגילים שבוצעו</span>
                    </div>
                    <div className="stat-item">
                        <span className="value">100%</span>
                        <span className="label">התמדה</span>
                    </div>
                </div>

                <button onClick={handleClose} className="close-btn">
                    סגור והמשך
                </button>
            </div>

            <style jsx>{`
                .summary-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    transition: opacity 0.3s;
                    backdrop-filter: blur(5px);
                }
                .summary-overlay.visible {
                    opacity: 1;
                }
                .summary-card {
                    background: linear-gradient(145deg, #1a1a1a, #000);
                    border: 1px solid var(--accent);
                    padding: 40px 30px;
                    border-radius: 24px;
                    text-align: center;
                    max-width: 90%;
                    width: 350px;
                    transform: scale(0.9);
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 0 50px rgba(34, 211, 238, 0.2);
                }
                .summary-overlay.visible .summary-card {
                    transform: scale(1);
                }
                .icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    animation: bounce 1s infinite;
                }
                h2 {
                    color: #fff;
                    margin: 0 0 10px 0;
                    font-size: 1.8rem;
                }
                .subtitle {
                    color: #888;
                    margin-bottom: 30px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 30px;
                }
                .stat-item {
                    background: rgba(255,255,255,0.05);
                    padding: 15px;
                    border-radius: 12px;
                }
                .value {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: var(--accent);
                }
                .label {
                    font-size: 0.8rem;
                    color: #666;
                }
                .close-btn {
                    background: var(--accent);
                    color: #000;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 30px;
                    font-weight: bold;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: transform 0.2s;
                    width: 100%;
                }
                .close-btn:hover {
                    transform: scale(1.05);
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
}
