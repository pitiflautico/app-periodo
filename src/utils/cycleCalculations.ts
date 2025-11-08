import { differenceInDays, addDays, parseISO, format, startOfDay } from 'date-fns';
import { Period } from '../types';

export interface CyclePhase {
  phase: 'period' | 'fertile' | 'ovulation' | 'normal';
  dayOfCycle: number;
}

/**
 * Calculate the average cycle length from a list of periods
 */
export const calculateAverageCycleLength = (periods: Period[]): number => {
  if (periods.length < 2) return 28; // Default

  const sortedPeriods = [...periods].sort((a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  let totalDays = 0;
  let count = 0;

  for (let i = 1; i < sortedPeriods.length; i++) {
    const days = differenceInDays(
      parseISO(sortedPeriods[i].startDate),
      parseISO(sortedPeriods[i - 1].startDate)
    );
    if (days > 0 && days < 45) { // Reasonable cycle length
      totalDays += days;
      count++;
    }
  }

  return count > 0 ? Math.round(totalDays / count) : 28;
};

/**
 * Calculate the average period length
 */
export const calculateAveragePeriodLength = (periods: Period[]): number => {
  const completedPeriods = periods.filter(p => p.endDate);

  if (completedPeriods.length === 0) return 5; // Default

  const totalDays = completedPeriods.reduce((sum, period) => {
    const days = differenceInDays(
      parseISO(period.endDate!),
      parseISO(period.startDate)
    );
    return sum + days;
  }, 0);

  return Math.round(totalDays / completedPeriods.length);
};

/**
 * Get the current active period if any
 */
export const getCurrentPeriod = (periods: Period[]): Period | null => {
  return periods.find(p => !p.endDate) || null;
};

/**
 * Get the last completed period
 */
export const getLastPeriod = (periods: Period[]): Period | null => {
  const sortedPeriods = [...periods]
    .filter(p => p.endDate)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return sortedPeriods[0] || null;
};

/**
 * Calculate which day of the cycle we are on
 */
export const getCurrentCycleDay = (
  periods: Period[],
  averageCycleLength: number,
  currentDate: Date = new Date()
): number => {
  const activePeriod = getCurrentPeriod(periods);

  if (activePeriod) {
    return differenceInDays(currentDate, parseISO(activePeriod.startDate)) + 1;
  }

  const lastPeriod = getLastPeriod(periods);

  if (!lastPeriod) return 1;

  const daysSinceLastPeriod = differenceInDays(
    currentDate,
    parseISO(lastPeriod.startDate)
  );

  return (daysSinceLastPeriod % averageCycleLength) + 1;
};

/**
 * Predict the next period start date
 */
export const predictNextPeriod = (
  periods: Period[],
  averageCycleLength: number
): Date | null => {
  const lastPeriod = getLastPeriod(periods);
  const activePeriod = getCurrentPeriod(periods);

  if (activePeriod) {
    return addDays(parseISO(activePeriod.startDate), averageCycleLength);
  }

  if (!lastPeriod) return null;

  return addDays(parseISO(lastPeriod.startDate), averageCycleLength);
};

/**
 * Predict ovulation date (typically 14 days before next period)
 */
export const predictOvulation = (
  periods: Period[],
  averageCycleLength: number
): Date | null => {
  const nextPeriod = predictNextPeriod(periods, averageCycleLength);
  if (!nextPeriod) return null;

  return addDays(nextPeriod, -14);
};

/**
 * Get fertile window (typically 5 days before ovulation and day of ovulation)
 */
export const getFertileWindow = (
  periods: Period[],
  averageCycleLength: number
): { start: Date; end: Date } | null => {
  const ovulation = predictOvulation(periods, averageCycleLength);
  if (!ovulation) return null;

  return {
    start: addDays(ovulation, -5),
    end: ovulation,
  };
};

/**
 * Determine the phase for a specific date
 */
export const getPhaseForDate = (
  date: Date,
  periods: Period[],
  averageCycleLength: number,
  averagePeriodLength: number
): CyclePhase => {
  const dateStr = format(startOfDay(date), 'yyyy-MM-dd');

  // Check if date is in any period
  for (const period of periods) {
    const periodStart = parseISO(period.startDate);
    const periodEnd = period.endDate ? parseISO(period.endDate) : addDays(periodStart, averagePeriodLength);

    if (date >= periodStart && date <= periodEnd) {
      const dayOfCycle = differenceInDays(date, periodStart) + 1;
      return { phase: 'period', dayOfCycle };
    }
  }

  // Calculate cycle day
  const cycleDay = getCurrentCycleDay(periods, averageCycleLength, date);

  // Check for ovulation (day 14 typically)
  const ovulationDay = averageCycleLength - 14;
  if (cycleDay === ovulationDay) {
    return { phase: 'ovulation', dayOfCycle: cycleDay };
  }

  // Check for fertile window (5 days before ovulation)
  if (cycleDay >= ovulationDay - 5 && cycleDay < ovulationDay) {
    return { phase: 'fertile', dayOfCycle: cycleDay };
  }

  return { phase: 'normal', dayOfCycle: cycleDay };
};

/**
 * Get days until next period
 */
export const getDaysUntilNextPeriod = (
  periods: Period[],
  averageCycleLength: number
): number => {
  const nextPeriod = predictNextPeriod(periods, averageCycleLength);
  if (!nextPeriod) return 0;

  const days = differenceInDays(nextPeriod, new Date());
  return Math.max(0, days);
};

/**
 * Get days until ovulation
 */
export const getDaysUntilOvulation = (
  periods: Period[],
  averageCycleLength: number
): number => {
  const ovulation = predictOvulation(periods, averageCycleLength);
  if (!ovulation) return 0;

  const days = differenceInDays(ovulation, new Date());
  return Math.max(0, days);
};

/**
 * Check if currently in fertile window
 */
export const isInFertileWindow = (
  periods: Period[],
  averageCycleLength: number
): boolean => {
  const fertileWindow = getFertileWindow(periods, averageCycleLength);
  if (!fertileWindow) return false;

  const now = new Date();
  return now >= fertileWindow.start && now <= fertileWindow.end;
};
