'use client';

export default function WeekTabs({ weeks, activeWeek, onSelect }) {
    return (
        <div className="week-tabs-container">
            <div className="week-tabs">
                {weeks.map((week, index) => (
                    <button
                        key={index}
                        className={`week-tab ${activeWeek === index ? 'active' : ''}`}
                        onClick={() => onSelect(index)}
                    >
                        <span className="week-name">{week.name || `T${index + 1}`}</span>
                        <span className="week-date">{week.dateRange}</span>
                    </button>
                ))}
            </div>
            <style jsx>{`
        .week-tabs-container {
            overflow-x: auto;
            white-space: nowrap;
            padding: 10px 0;
            background: var(--background);
            position: sticky;
            top: 0;
            z-index: 20;
            border-bottom: 1px solid #333;
            -webkit-overflow-scrolling: touch;
        }
        .week-tabs {
            display: inline-flex;
            gap: 10px;
            padding: 0 1rem;
        }
        .week-tab {
            background: #222;
            border: 1px solid #444;
            color: #aaa;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 80px;
            transition: all 0.2s;
        }
        .week-tab.active {
            background: var(--accent);
            color: #000;
            border-color: var(--accent);
            font-weight: bold;
        }
        .week-name {
            font-size: 0.9em;
        }
        .week-date {
            font-size: 0.7em;
            opacity: 0.8;
        }
      `}</style>
        </div>
    );
}
