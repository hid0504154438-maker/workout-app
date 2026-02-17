export const VIDEO_MAP = {
    // --- Mobility & Warmup ---
    'חתול - גמל': 'qf5q47b85gQ', // Cat-Cow
    'Cat-Cow': 'qf5q47b85gQ',
    '90/90': 't4Zz6-aG8Iw', // 90/90 Hip Mobility
    '90/90 לירך': 't4Zz6-aG8Iw',
    'סקוואט גביע': 'M9465qO56Y', // Goblet Squat
    'Goblet Squat': 'M9465qO56Y',
    'מכרע בולגרי': 'h13_P9xNl3Q', // Bulgarian Split Squat
    'Bulgarian Split Squat': 'h13_P9xNl3Q',
    'פייס פול': '0n6_yv65XOY', // Face Pull
    'Face Pull': '0n6_yv65XOY',
    'ג׳פרסון קרל': '4Y416fW2-dY', // Jefferson Curl
    'Jefferson Curl': '4Y416fW2-dY',
    'הולו באדי': 'k6qRU2qJtVs', // Hollow Body
    'Hollow Body': 'k6qRU2qJtVs',
    'דד באג': 'QIYFt7qQbJw', // Dead Bug
    'Dead Bug': 'QIYFt7qQbJw',
    'מתיחת כתף צולבת': 'sCIE5o2hDdQ',
    'ישיבת סקוואט עמוק': 'lbozu0DPcYI',

    // --- Chest ---
    'לחיצת חזה': 'rT7DgCr-3pg', // Bench Press
    'לחיצת חזה בשיפוע חיובי': '2jN1dw9-tB3', // Incline Bench Press
    'פרפר': 'eozVVw7-1kE', // Machine Fly
    'פרפר במכונה': 'eozVVw7-1kE',
    'פרפר כבלים': 'Iwe6AmxVf7o', // Cable Fly
    'שכיבות שמיכה': 'IODxDxX7oi4', // Pushups
    'שכיבות סמיכה': 'IODxDxX7oi4',
    'לחיצת חזה עליון': '2jN1dw9-tB3',

    // --- Back ---
    'מתח': 'eGo4IYlbE5g', // Pullups
    'משיכת פולי עליון': 'CAwf7n6Luuc', // Lat Pulldown
    'פולי עליון': 'CAwf7n6Luuc',
    'חתירה': 'G8l_8chR5BE', // Barbell Row
    'חתירה יד אחת': 'pYcpY20QaE8', // One Arm DB Row
    'חתירה במכונה': 'H75im9h-9d', // Machine Row
    'דדליפט': 'op9kVnSso6Q', // Deadlift

    // --- Legs ---
    'סקוואט': 'bEv6CCg2bc8', // Squat
    'באק סקוואט': 'bEv6CCg2bc8',
    'מכרעים': 'QOVaHwlE5HY', // Lunges
    'לאנג\'': 'QOVaHwlE5HY',
    'לחיצת רגליים': 'IZxyjW7MPJQ', // Leg Press
    'פשיטת ברכיים': 'YyvSfVjQeL0', // Leg Extension
    'כפיפת ברכיים': '1Tq3QdYUuHs', // Leg Curl

    // --- Shoulders ---
    'לחיצת כתפיים': 'QAQ64hK4Xxs', // Overhead Press
    'לחיצת כתפיים במכונה': 'WvLMauqrnK8',
    'הרחקת כתפיים': '3VcKaXpzqRo', // Lateral Raise
    'הרחקת לצדדים': '3VcKaXpzqRo',

    // --- Arms ---
    'כפיפת מרפקים': 'in7PaeYlhrM', // Bicep Curl
    'פשיטת מרפקים': '6kALZikXxLc', // Tricep Extension
    'פשיטת מרפקים בפולי': '6kALZikXxLc',
    'יד אחורית': '6kALZikXxLc',
    'יד קדמית': 'in7PaeYlhrM',
    'פטישים': 'zC3nLlEvin4', // Hammer Curls

    // --- Core ---
    'פלאנק': 'ASdvN_XEl_c', // Plank
    'בטן סטטית': 'ASdvN_XEl_c',
    'גלגל בטן': 'RqOcdFfN0jE', // Ab Wheel
    'כפיפות בטן': 'Xyd_fa5zoEU',
    'בטן': 'Xyd_fa5zoEU',

    // --- English Defaults ---
    'Bench Press': 'rT7DgCr-3pg',
    'Squat': 'bEv6CCg2bc8',
    'Deadlift': 'op9kVnSso6Q',
    'Overhead Press': 'QAQ64hK4Xxs',
    'Pullups': 'eGo4IYlbE5g'
};

export const getVideoId = (exerciseName) => {
    if (!exerciseName) return null;

    // 1. Try exact match
    if (VIDEO_MAP[exerciseName]) return VIDEO_MAP[exerciseName];

    // 2. Try partial match (Prioritize longer keys to avoid "Pushups" matching "Box Pushups" incorrectly if map had both)
    // Example: "לחיצת חזה כנגד משקולות" -> matches "לחיצת חזה"
    const normalized = exerciseName.trim();
    const sortedKeys = Object.keys(VIDEO_MAP).sort((a, b) => b.length - a.length);

    const partialMatch = sortedKeys.find(key => normalized.includes(key));
    return partialMatch ? VIDEO_MAP[partialMatch] : null;
};
