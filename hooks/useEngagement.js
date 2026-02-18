import { useMemo, useState, useEffect } from 'react';

export function useEngagement(weeks) {
    const stats = useMemo(() => {
        if (!weeks || weeks.length === 0) {
            return { streak: 0, thisWeekCount: 0, lastWorkoutDate: null };
        }

        let streak = 0;
        let thisWeekCount = 0;
        let lastWorkoutDate = null; // Initialize lastWorkoutDate
        const now = new Date();
        const currentWeekIndex = 0; // Assuming weeks are reversed (0 is latest)

        // Calculate "This Week" workouts
        // We assume weeks[0] is the current week if active, or just the latest week data
        // Ideally we should check if weeks[0] date range matches "now", but for simplicity we'll just check the latest week object.
        if (weeks[0]) {
            thisWeekCount = weeks[0].days.filter(d =>
                d.exercises.some(ex => ex.actualSets && ex.actualSets.trim().length > 0)
            ).length;
        }

        // Calculate Streak (Consecutive weeks with at least 1 workout)
        // We'll simplisticly count backwards from the latest week.
        // If a week has > 0 completed workouts, streak++
        // If we hit a week with 0, streak stops.
        for (let i = 0; i < weeks.length; i++) {
            const weekHasWorkout = weeks[i].days.some(d =>
                d.exercises.some(ex => ex.actualSets && ex.actualSets.trim().length > 0)
            );

            if (weekHasWorkout) {
                streak++;
            } else {
                // If it's the CURRENT week and we haven't trained YET, it shouldn't necessarily break the streak from previous weeks?
                // But for "Active Streak", usually it implies continuous history.
                // Let's be kind: if index 0 (current) is empty, don't count it, but don't break immediately if index 1 has data?
                // Simpler logic: Streak = consecutive non-empty weeks.
                if (i === 0 && thisWeekCount === 0) continue; // Skip current week if empty, check previous
                break;
            }
        }

        return { streak, thisWeekCount };
    }, [weeks]);

    const { streak, thisWeekCount } = stats;
    const completedThisWeek = streak > 0 ? thisWeekCount : 0;

    // Israel's Voice - Dynamic Quotes
    const quotes = [
        "המשקלים היום מחכים שתזיז אותם. העקביות שלך היא הניצחון הכי גדול. 💪",
        "העליתי לך קצת את הראף היום כי ראיתי מה עשית שבוע שעבר. סומך עליך. ⭐",
        "גם אם היום מרגיש כבד - כל חזרה בונה אותך. תן עבודה. 🔥",
        "לא משנה כמה עייף באת, משנה כמה חזק תצא. 🚀",
        "זה הזמן שלך עם עצמך. תתנתק מהרעש ותתרכז בברזל. 🎧",
        "השינוי קורה בחזרות האחרונות, אלה שממש קשה לך בהן. אל תוותר שם. 💎"
    ];

    // Pick a quote based on the day of the year to keep it consistent for the day, or random?
    // User asked for "Random everytime user opens workout page".
    // We'll use a simple randomizer, but hydration mismatch might occur if done directly in render.
    // Better to use useEffect or just suppress warning if it's client only.
    // Since useEngagement is a hook, let's return a random one but stabilize it slightly or just return list?
    // Let's pick one randomly on mount.

    const [greeting, setGreeting] = useState({ title: '', subtitle: '' });

    useEffect(() => {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        let sub = "בוא נזוז!";
        if (streak > 2) sub = `${streak} שבועות ברצף! אש עליך 🔥`;
        else if (thisWeekCount > 1) sub = `אימון ${thisWeekCount + 1} השבוע.אלוף!`;

        setGreeting({ title: randomQuote, subtitle: sub });
    }, [streak, thisWeekCount]);

    return { ...stats, greeting };
}
