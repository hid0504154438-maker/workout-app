export default function ProgressBar({ total, completed, label = '', color = 'var(--accent)' }) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="progress-container">
            <div className="progress-header">
                {label && <span className="progress-label">{label}</span>}
                <span className="progress-value">{percentage}%</span>
            </div>
            <div className="progress-track">
                <div
                    className="progress-fill"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                ></div>
            </div>

            <style jsx>{`
        .progress-container {
          width: 100%;
          margin: 10px 0;
        }
        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .progress-value {
          font-weight: bold;
          color: var(--text-main);
        }
        .progress-track {
          width: 100%;
          height: 10px; /* Thicker for better visibility */
          background: rgba(0,0,0,0.1);
          border-radius: 5px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 10px ${color}; /* Glow effect */
        }
      `}</style>
        </div>
    );
}
