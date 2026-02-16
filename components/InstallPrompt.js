'use client';
import { useState, useEffect } from 'react';

export default function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if standalone
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

        // Check if iOS
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(ios);

        // Initial check (delay to let things load)
        const timer = setTimeout(() => {
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                setIsVisible(true);
            }
        }, 2000);

        // Capture install prompt event (Android/Desktop)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsVisible(false);
            }
            setDeferredPrompt(null);
        }
    };

    if (!isVisible || isStandalone) return null;

    return (
        <div className="install-banner">
            <div className="content">
                <div className="icon">📱</div>
                <div className="text">
                    <strong>התקן את האפליקציה</strong>
                    <p>לחוויית שימוש נוחה ומהירה יותר</p>
                </div>
            </div>

            {isIOS ? (
                <div className="ios-instructions">
                    <span>לחץ על <span className="share-icon">⎋</span> ואז <strong>"הוסף למסך הבית"</strong></span>
                    <button className="close-btn" onClick={() => setIsVisible(false)}>סגור</button>
                </div>
            ) : (
                <div className="actions">
                    <button className="install-btn" onClick={handleInstallClick}>התקן</button>
                    <button className="close-btn" onClick={() => setIsVisible(false)}>אולי אח"כ</button>
                </div>
            )}

            <style jsx>{`
        .install-banner {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: rgba(30, 30, 30, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid #444;
            border-radius: 16px;
            padding: 16px;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            animation: slideUp 0.5s ease-out;
            direction: rtl;
        }
        @keyframes slideUp {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .content {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 12px;
        }
        .icon { font-size: 2rem; }
        .text strong { display: block; font-size: 1.1rem; margin-bottom: 2px; }
        .text p { margin: 0; color: #aaa; font-size: 0.9rem; }

        .actions {
            display: flex;
            gap: 10px;
        }
        .install-btn {
            background: var(--accent);
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: bold;
            flex-grow: 1;
            cursor: pointer;
        }
        .close-btn {
            background: transparent;
            color: #888;
            border: none;
            padding: 10px;
            cursor: pointer;
        }
        
        .ios-instructions {
            background: #222;
            padding: 10px;
            border-radius: 8px;
            font-size: 0.9rem;
            text-align: center;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .share-icon {
            font-family: -apple-system, sans-serif;
            font-size: 1.2rem;
            margin: 0 4px;
            vertical-align: middle;
            color: #4a90e2;
        }
      `}</style>
        </div>
    );
}
