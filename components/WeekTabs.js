'use client';

export default function WeekTabs({ weeks, activeWeek, onSelect, orientation = 'vertical' }) {
    return (
        <div className={`week-tabs-container ${orientation}`}>
            <div className="week-tabs">
                {weeks.map((week, index) => (
                    <button
                        key={index}
                        className={`week-tab ${activeWeek === index ? 'active' : ''}`}
                        onClick={() => onSelect(index)}
                    >
                        <span className="week-number">{index + 1}</span>
                        {/* Hide date range in vertical mode to save space */}
                        {orientation === 'horizontal' && <span className="week-date">{week.dateRange}</span>}
                    </button>
                ))}
            </div>
            <style jsx>{`
        .week-tabs-container {
            height: 100%;
            background: #111;
        }
        .week-tabs {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 20px 10px;
            align-items: center;
        }
        .week-tab {
            width: 40px;
            height: 40px;
            border-radius: 50%; /* Circle shape */
            background: #222;
            border: 1px solid #444;
            color: #888;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            font-weight: bold;
        }
        .week-tab.active {
            background: var(--accent);
            color: #000;
            border-color: var(--accent);
            transform: scale(1.1);
        }
        .week-number {
            font-size: 1.1rem;
        }
      `}</style>
        </div>
    );
}
