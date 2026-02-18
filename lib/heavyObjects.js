export const heavyObjects = [
    { weight: 4, name: 'חתול שמנמן 🐈', emoji: '🐈' },
    { weight: 10, name: 'שישיית מים 💧', emoji: '💧' },
    { weight: 20, name: 'מזוודה עמוסה 🧳', emoji: '🧳' },
    { weight: 40, name: 'שק מלט 🏗️', emoji: '🏗️' },
    { weight: 70, name: 'מכונת כביסה 🧺', emoji: '🧺' },
    { weight: 80, name: 'ספה זוגית 🛋️', emoji: '🛋️' },
    { weight: 100, name: 'קטנוע 🛵', emoji: '🛵' },
    { weight: 150, name: 'פנדת ענק 🐼', emoji: '🐼' },
    { weight: 200, name: 'אריה בוגר 🦁', emoji: '🦁' },
    { weight: 300, name: 'פסנתר כנף 🎹', emoji: '🎹' },
    { weight: 500, name: 'סוס מרוץ 🐎', emoji: '🐎' },
    { weight: 800, name: 'פרה חולבת 🐄', emoji: '🐄' },
    { weight: 1000, name: 'רכב פרטי 🚗', emoji: '🚗' },
    { weight: 1500, name: 'היפופוטם 🦛', emoji: '🦛' },
    { weight: 2000, name: 'ג\'יפ 4x4 🚙', emoji: '🚙' },
    { weight: 3000, name: 'משאית קטנה 🚚', emoji: '🚚' },
    { weight: 5000, name: 'פיל אפריקאי 🐘', emoji: '🐘' },
    { weight: 10000, name: 'אוטובוס מלא 🚌', emoji: '🚌' },
    { weight: 30000, name: 'לוויתן 🐋', emoji: '🐋' },
    { weight: 50000, name: 'טנק מרכבה 🛡️', emoji: '🛡️' },
    { weight: 100000, name: 'מטוס נוסעים ✈️', emoji: '✈️' },
    { weight: 200000, name: 'פסל החירות 🗽', emoji: '🗽' }
];

export function getEquivalentObject(totalWeight) {
    // Find the closest object that is <= totalWeight
    // Or maybe just the largest object that is smaller than totalWeight?
    // Let's find the object that is closest in magnitude.

    // Sort by weight desc
    const sorted = [...heavyObjects].sort((a, b) => b.weight - a.weight);

    // Find first object smaller than totalWeight
    const found = sorted.find(obj => obj.weight <= totalWeight);

    // If lifting less than a cat, return cat anyway or "Not enough yet"
    return found || heavyObjects[heavyObjects.length - 1]; // Return smallest if nothing found
}
