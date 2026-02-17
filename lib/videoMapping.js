export const VIDEO_MAP = {
    // Chest
    'לחיצת חזה': 'rT7DgCr-3pg', // Scott Herman: Bench Press
    'לחיצת חזה בשיפוע חיובי': '2jN1dw9-tB3', // Incline Bench Press
    'פרפר': 'eozVVw7-1kE', // Machine Fly
    'פרפר כבלים': 'Iwe6AmxVf7o', // Cable Fly
    'שכיבות שמיכה': 'IODxDxX7oi4', // Pushups

    // Back
    'מתח': 'eGo4IYlbE5g', // Pullups
    'משיכת פולי עליון': 'CAwf7n6Luuc', // Lat Pulldown
    'חתירה': 'G8l_8chR5BE', // Barbell Row
    'חתירה במכונה': 'H75im9h-9d', // Machine Row (placeholder ID)
    'דדליפט': 'op9kVnSso6Q', // Deadlift

    // Legs
    'סקוואט': 'bEv6CCg2bc8', // Squat
    'מכרעים': 'QOVaHwlE5HY', // Lunges
    'לחיצת רגליים': 'IZxyjW7MPJQ', // Leg Press
    'פשיטת ברכיים': 'YyvSfVjQeL0', // Leg Extension
    'כפיפת ברכיים': '1Tq3QdYUuHs', // Leg Curl

    // Shoulders
    'לחיצת כתפיים': 'QAQ64hK4Xxs', // Overhead Press
    'הרחקת כתפיים': '3VcKaXpzqRo', // Lateral Raise

    // Arms
    'כפיפת מרפקים': 'in7PaeYlhrM', // Bicep Curl
    'פשיטת מרפקים': '6kALZikXxLc', // Tricep Extension

    // English fallback
    'Bench Press': 'rT7DgCr-3pg',
    'Squat': 'bEv6CCg2bc8',
    'Deadlift': 'op9kVnSso6Q',
    'Overhead Press': 'QAQ64hK4Xxs',
    'Pullups': 'eGo4IYlbE5g'
};

export const getVideoId = (exerciseName) => {
    if (!exerciseName) return null;
    // Try exact match
    if (VIDEO_MAP[exerciseName]) return VIDEO_MAP[exerciseName];

    // Try partial match (e.g. "לחיצת חזה כאלעד" -> matches "לחיצת חזה")
    const normalized = exerciseName.trim();
    const key = Object.keys(VIDEO_MAP).find(k => normalized.includes(k));
    return key ? VIDEO_MAP[key] : null;
};
