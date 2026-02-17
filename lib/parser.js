import { parse } from 'csv-parse/sync';

export function processSheetData(rows) {
  // Convert array of arrays (Sheet data) to parser-friendly format if needed
  // csv-parse usually expects string or buffer. 
  // But since we get "values" (array of arrays) from Sheets API, we can adapt the logic.

  // The existing logic iterates over "records" which is an array of arrays.
  // So we can just pass the rows directly.
  const records = rows;

  const weeks = [];
  let currentWeek = null;
  let currentDay = null;

  for (const record of records) {
    // Check for Week
    if (record[0] && record[0].trim().startsWith('שבוע')) {
      if (currentDay && currentWeek) currentWeek.days.push(currentDay);
      if (currentWeek) weeks.push(currentWeek);
      currentWeek = { name: record[0], dateRange: record[1], days: [] };
      currentDay = null;
      continue;
    }

    // Check for Day
    if (record[0] && (record[0].includes('יום') || record[0].includes('אימון'))) {
      if (currentDay && currentWeek) currentWeek.days.push(currentDay);
      currentDay = { name: record[0], exercises: [] };
      continue;
    }

    // Process Exercise
    // Exercise name usually in col 1 ("תרגיל")
    const exerciseName = record[1];
    // Sometimes name is in col 0 if using special type (EMOM, Superset)
    const type = record[0];

    // Skip header rows
    if (exerciseName === 'תרגיל' || (record[2] && record[2].includes('סטים'))) continue;

    // Skip invalid rows
    if (!exerciseName && (!type || type.length < 2)) continue;

    const rowIndex = records.indexOf(record) + 1; // 1-based index (check if header affects this)

    // Fallback: If we are in a week but no Day defined yet, create a default "General" day
    if (!currentDay && currentWeek) {
      currentDay = { name: 'אימון', exercises: [] };
      // We need to push this new day to the week eventually. 
      // The loop logic pushes `currentDay` when a NEW day starts or date ends.
      // But if we create it here implicitly, we must ensure it gets pushed.
      // The existing logic `if (currentDay && currentWeek) currentWeek.days.push(currentDay)` triggers on new day/week.
      // So we just need to ensure `currentDay` is valid.
    }

    if (currentDay) {
      currentDay.exercises.push({
        type: type,
        name: exerciseName,
        sets: record[2],
        reps: record[3],
        weight: record[4],
        rest: record[5],
        notes: record[7],
        // actuals
        actualSets: record[8],
        actualReps: record[9],
        actualWeight: record[10],
        // For syncing
        rowIndex: rowIndex + 1 // +1 for strict 1-based line number if `indexOf` is 0-based from parsing. Note: csv-parse output array is 0-indexed. Sheet is 1-indexed.
      });
    }
  }

  // Push last entries
  if (currentDay && currentWeek) currentWeek.days.push(currentDay);
  if (currentWeek) weeks.push(currentWeek);

  return weeks;
}
