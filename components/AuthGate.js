'use client';
import { useState, useEffect } from 'react';

export default function AuthGate({ children, userSlug }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if already verified
        if (typeof window !== 'undefined') {
            const verified = localStorage.getItem(`workout-app-verified-${userSlug}`);
            if (verified === 'true') {
                setIsAuthenticated(true);
            }
        }
        setLoading(false);
    }, [userSlug]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userSlug, passcode: input })
            });

            const data = await res.json();

            if (data.success) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem(`workout-app-verified-${userSlug}`, 'true');
                }
                setIsAuthenticated(true);
            } else {
                throw new Error('Invalid passcode');
            }
        } catch (err) {
            setError(true);
            setInput('');
            setTimeout(() => setError(false), 2000);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null; // Prevent flash

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>🔒 כניסה למתאמן</h2>
                <p>הכנס קוד אישי כדי לצפות בתוכנית</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="tel"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="קוד (4 ספרות)"
                        maxLength={4}
                        className={error ? 'error' : ''}
                        autoFocus
                    />
                    <button type="submit">כנס</button>
                </form>
                {error && <div className="error-msg">קוד שגוי</div>}
            </div>

            <style jsx>{`
                .auth-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background: #000;
                    padding: 20px;
                }
                .auth-card {
                    background: #1a1a1a;
                    padding: 2rem;
                    border-radius: 16px;
                    border: 1px solid #333;
                    text-align: center;
                    width: 100%;
                    max-width: 350px;
                }
                h2 { margin-top: 0; color: #fff; }
                p { color: #888; margin-bottom: 2rem; }
                
                input {
                    display: block;
                    width: 100%;
                    padding: 15px;
                    font-size: 1.5rem;
                    text-align: center;
                    border-radius: 8px;
                    border: 1px solid #444;
                    background: #222;
                    color: #fff;
                    letter-spacing: 5px;
                    margin-bottom: 15px;
                }
                input:focus {
                    outline: none;
                    border-color: var(--accent);
                }
                input.error {
                    border-color: #f00;
                    animation: shake 0.3s;
                }
                
                button {
                    width: 100%;
                    padding: 15px;
                    background: var(--accent);
                    color: #000;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                }
                
                .error-msg {
                    color: #f00;
                    margin-top: 10px;
                }

                @keyframes shake {
                    0% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    50% { transform: translateX(5px); }
                    75% { transform: translateX(-5px); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
