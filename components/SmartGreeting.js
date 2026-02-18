'use client';

export default function SmartGreeting({ greeting, userSlug }) {
    // Basic mapping for Hebrew names if available or just use Slug nicely
    const displayName = userSlug.charAt(0).toUpperCase() + userSlug.slice(1);

    return (
        <div className="smart-greeting">
            <h1>{greeting}</h1>
            <span className="subtitle">המרדף אחרי הגרסה הכי טובה שלך</span>

            <style jsx>{`
                .smart-greeting {
                    margin-bottom: 20px;
                    animation: fadeIn 0.8s ease-out;
                }
                h1 {
                    font-size: 1.8rem;
                    margin: 0 0 5px 0;
                    font-weight: 800;
                    background: linear-gradient(to right, #fff, #fbbf24); /* Gold/Yellow tint for 'wow' */
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -0.5px;
                }
                .subtitle {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
