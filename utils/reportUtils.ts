import { BehaviorEntry, BehaviorCategory, Student, BehaviorReport } from '@/types';

export const generateStudentReport = (
  student: Student,
  entries: BehaviorEntry[],
  behaviors: BehaviorCategory[],
  dateRange: { start: Date; end: Date }
): BehaviorReport => {
  const filteredEntries = entries.filter(
    entry => 
      entry.studentId === student.id &&
      entry.timestamp >= dateRange.start &&
      entry.timestamp <= dateRange.end
  );

  const positiveEntries = filteredEntries.filter(entry => {
    const behavior = behaviors.find(b => b.id === entry.behaviorId);
    return behavior?.type === 'positive';
  });

  const negativeEntries = filteredEntries.filter(entry => {
    const behavior = behaviors.find(b => b.id === entry.behaviorId);
    return behavior?.type === 'negative';
  });

  // Generate weekly trends
  const trends = generateWeeklyTrends(filteredEntries, behaviors, dateRange);

  return {
    studentId: student.id,
    dateRange,
    totalPositive: positiveEntries.length,
    totalNegative: negativeEntries.length,
    entries: filteredEntries,
    trends,
  };
};

const generateWeeklyTrends = (
  entries: BehaviorEntry[],
  behaviors: BehaviorCategory[],
  dateRange: { start: Date; end: Date }
) => {
  const trends = [];
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  let currentWeekStart = new Date(dateRange.start);
  let week = 1;

  while (currentWeekStart <= dateRange.end) {
    const weekEnd = new Date(Math.min(
      currentWeekStart.getTime() + weekMs,
      dateRange.end.getTime()
    ));

    const weekEntries = entries.filter(
      entry => entry.timestamp >= currentWeekStart && entry.timestamp <= weekEnd
    );

    const positiveCount = weekEntries.filter(entry => {
      const behavior = behaviors.find(b => b.id === entry.behaviorId);
      return behavior?.type === 'positive';
    }).length;

    const negativeCount = weekEntries.filter(entry => {
      const behavior = behaviors.find(b => b.id === entry.behaviorId);
      return behavior?.type === 'negative';
    }).length;

    trends.push({
      week,
      positiveCount,
      negativeCount,
    });

    currentWeekStart = new Date(currentWeekStart.getTime() + weekMs);
    week++;
  }

  return trends;
};

export const calculateBehaviorScore = (
  entries: BehaviorEntry[],
  behaviors: BehaviorCategory[]
): number => {
  return entries.reduce((total, entry) => {
    const behavior = behaviors.find(b => b.id === entry.behaviorId);
    return total + (behavior?.points || 0);
  }, 0);
};

export const formatDateRange = (start: Date, end: Date): string => {
  const startStr = start.toLocaleDateString();
  const endStr = end.toLocaleDateString();
  return `${startStr} - ${endStr}`;
};