export const validateTimetable = (timetable, periods) => {
  const errors = [];
  const MAX_PERIODS = periods.length;

  const periodFacultyMap = Array(MAX_PERIODS).fill(null).map(() => new Set());

  for (let dayIndex = 0; dayIndex < timetable.length; dayIndex++) {
    for (let periodIndex = 0; periodIndex < MAX_PERIODS; periodIndex++) {
      const slot = timetable[dayIndex]?.[periodIndex];

      if (!slot) continue;

      // Skip breaks/lunch
      if (
        periods[periodIndex]?.name?.toLowerCase().includes('break') ||
        periods[periodIndex]?.name?.toLowerCase().includes('lunch')
      ) {
        errors.push(`❌ Break period used: Day ${dayIndex}, Period ${periodIndex}`);
        continue;
      }

      // Lab check: must be consecutive
      if (slot.isLab && periodIndex + 1 < MAX_PERIODS &&
          timetable[dayIndex][periodIndex + 1]?.name !== slot.name
      ) {
        errors.push(`❌ Lab split at Day ${dayIndex}, Period ${periodIndex}`);
      }

      // Faculty time conflict
      if (periodFacultyMap[periodIndex].has(slot.faculty)) {
        errors.push(`❌ Faculty "${slot.faculty}" assigned to same period on multiple days`);
      }

      periodFacultyMap[periodIndex].add(slot.faculty);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};