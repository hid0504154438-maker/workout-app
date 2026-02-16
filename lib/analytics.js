export const logEvent = (user, action, label, metadata = {}) => {
    try {
        // Use sendBeacon for reliability on page unload, or fetch for general interactions
        const payload = {
            timestamp: new Date().toISOString(),
            user,
            action,
            label,
            metadata
        };

        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            navigator.sendBeacon('/api/analytics', blob);
        } else {
            fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(err => console.error('Analytics log failed', err));
        }
    } catch (e) {
        console.error('Analytics Error', e);
    }
};
