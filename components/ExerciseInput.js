'use client';

import { useOptimistic, useTransition, useState, useEffect } from 'react';
import { updateExerciseAction } from '../app/actions';

export default function ExerciseInput({
    userSlug,
    dayName,
    exerciseName,
    field,
    initialValue,
    label,
    placeholder,
    type = 'text'
}) {
    const [isPending, startTransition] = useTransition();
    const [showSuccess, setShowSuccess] = useState(false);

    // Optimistic State
    const [optimisticValue, addOptimisticValue] = useOptimistic(
        initialValue || '',
        (state, newValue) => newValue
    );

    // Keep optimistic value in sync if initialValue changes from outside (e.g. refresh)
    // actually useOptimistic handles strict state, but if props update we might need a reset?
    // standard pattern is enough usually.

    const handleBlur = async (e) => {
        const newValue = e.target.value;
        if (newValue === initialValue) return; // No change

        // 1. Optimistic Update
        startTransition(() => {
            addOptimisticValue(newValue);
        });

        // 2. Server Action
        const result = await updateExerciseAction(userSlug, dayName, exerciseName, field, newValue);

        if (result.success) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } else {
            console.error(result.message);
            alert('שגיאה בשמירה! נסה שוב. ❌');
        }
    };

    // For Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    return (
        <div className="input-wrapper">
            {label && <label className="input-label">{label}</label>}
            <div className="relative-container">
                <input
                    type={type}
                    name={field}
                    defaultValue={optimisticValue}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    inputMode="decimal" // User request for numeric keypad
                    className={`
                        modern-input 
                        ${isPending ? 'pending' : ''} 
                        ${showSuccess ? 'success-border' : ''}
                    `}
                />

                {/* Visual Indicators */}
                <div className="indicator-icon">
                    {isPending && <div className="spinner"></div>}
                    {!isPending && showSuccess && <span className="checkmark">✓</span>}
                </div>
            </div>

            <style jsx>{`
                .input-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    width: 100%;
                }
                .input-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 500;
                    margin-left: 4px;
                }
                .relative-container {
                    position: relative;
                    width: 100%;
                }
                .modern-input {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.03); /* Darker specific for light mode input bg */
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 12px;
                    font-size: 1.1rem;
                    color: var(--text-main);
                    font-weight: 600;
                    outline: none;
                    transition: all 0.2s ease;
                }
                .modern-input:focus {
                    background: rgba(255, 255, 255, 0.5);
                    border-color: var(--accent);
                    box-shadow: 0 0 0 2px var(--accent-glow);
                }
                
                .pending {
                    opacity: 0.7;
                }
                .success-border {
                    border-color: #22c55e !important; /* Green */
                    background: rgba(34, 197, 94, 0.05);
                }

                .indicator-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .checkmark {
                    color: #22c55e;
                    font-weight: bold;
                    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255,255,255,0.1);
                    border-top-color: var(--accent);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}
