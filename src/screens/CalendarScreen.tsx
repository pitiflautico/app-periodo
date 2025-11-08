import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { NavigationParamList, Period } from '../types';
import { getPeriods, getUserProfile } from '../services/storage';
import {
  getPhaseForDate,
  calculateAverageCycleLength,
  calculateAveragePeriodLength,
} from '../utils/cycleCalculations';

type CalendarNavigationProp = StackNavigationProp<NavigationParamList, 'Calendar'>;

const { width } = Dimensions.get('window');
const DAY_SIZE = (width - SPACING.lg * 2) / 7;

const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<CalendarNavigationProp>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [periods, setPeriods] = useState<Period[]>([]);
  const [averageCycleLength, setAverageCycleLength] = useState(28);
  const [averagePeriodLength, setAveragePeriodLength] = useState(5);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const loadData = async () => {
    try {
      const storedPeriods = await getPeriods();
      const profile = await getUserProfile();

      setPeriods(storedPeriods);

      const avgCycle = profile?.averageCycleLength || calculateAverageCycleLength(storedPeriods);
      const avgPeriod = profile?.averagePeriodLength || calculateAveragePeriodLength(storedPeriods);

      setAverageCycleLength(avgCycle);
      setAveragePeriodLength(avgPeriod);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { locale: es });
    const end = endOfWeek(endOfMonth(currentMonth), { locale: es });
    return eachDayOfInterval({ start, end });
  };

  const getColorForDate = (date: Date) => {
    const phase = getPhaseForDate(date, periods, averageCycleLength, averagePeriodLength);

    switch (phase.phase) {
      case 'period':
        return COLORS.period;
      case 'fertile':
        return COLORS.fertile;
      case 'ovulation':
        return COLORS.ovulation;
      default:
        return 'transparent';
    }
  };

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
    navigation.navigate('DayDetails', { date: format(date, 'yyyy-MM-dd') });
  };

  const renderDay = (date: Date) => {
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isToday = isSameDay(date, new Date());
    const color = getColorForDate(date);

    return (
      <TouchableOpacity
        key={date.toString()}
        style={[
          styles.dayCell,
          !isCurrentMonth && styles.dayCellInactive,
        ]}
        onPress={() => handleDatePress(date)}
      >
        <View
          style={[
            styles.dayCircle,
            color !== 'transparent' && { backgroundColor: color },
            isToday && styles.dayCircleToday,
          ]}
        >
          <Text
            style={[
              styles.dayText,
              !isCurrentMonth && styles.dayTextInactive,
              color !== 'transparent' && styles.dayTextActive,
              isToday && styles.dayTextToday,
            ]}
          >
            {format(date, 'd')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calendario</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
            style={styles.monthButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.monthSelector}>
            <Text style={styles.monthText}>
              {format(currentMonth, 'MMMM', { locale: es })}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.text} />
          </View>

          <TouchableOpacity
            onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
            style={styles.monthButton}
          >
            <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Weekday Headers */}
        <View style={styles.weekdayHeader}>
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <View key={day} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {getDaysInMonth().map((date) => renderDay(date))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Leyenda</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.period }]} />
              <Text style={styles.legendText}>Periodo</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.fertile }]} />
              <Text style={styles.legendText}>Días fértiles</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.ovulation }]} />
              <Text style={styles.legendText}>Ovulación</Text>
            </View>

            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.symptomsColor }]} />
              <Text style={styles.legendText}>Síntomas/Humor</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddPeriod')}
      >
        <Ionicons name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.hero,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.backgroundPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  monthButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundPink,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  monthText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  weekdayHeader: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  weekdayCell: {
    width: DAY_SIZE,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  weekdayText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  dayCellInactive: {
    opacity: 0.3,
  },
  dayCircle: {
    width: DAY_SIZE - 8,
    height: DAY_SIZE - 8,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  dayTextInactive: {
    color: COLORS.textLight,
  },
  dayTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  dayTextToday: {
    fontWeight: 'bold',
  },
  legend: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
  },
  legendTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  legendItems: {
    gap: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  legendDot: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.round,
  },
  legendText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default CalendarScreen;
