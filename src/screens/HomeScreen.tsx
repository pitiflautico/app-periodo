import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressRing from '../components/ProgressRing';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { NavigationParamList, Period } from '../types';
import { getPeriods, getUserProfile, getDailyLogs } from '../services/storage';
import {
  getCurrentCycleDay,
  calculateAverageCycleLength,
  calculateAveragePeriodLength,
  getDaysUntilNextPeriod,
  getDaysUntilOvulation,
  getCurrentPeriod,
  isInFertileWindow,
} from '../utils/cycleCalculations';

type HomeNavigationProp = StackNavigationProp<NavigationParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [currentCycleDay, setCurrentCycleDay] = useState(1);
  const [averageCycleLength, setAverageCycleLength] = useState(28);
  const [averagePeriodLength, setAveragePeriodLength] = useState(5);
  const [daysUntilPeriod, setDaysUntilPeriod] = useState(0);
  const [daysUntilOvulation, setDaysUntilOvulation] = useState(0);
  const [inFertileWindow, setInFertileWindow] = useState(false);
  const [activePeriod, setActivePeriod] = useState<Period | null>(null);
  const [userName, setUserName] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const storedPeriods = await getPeriods();
      const profile = await getUserProfile();

      setPeriods(storedPeriods);

      if (profile?.name) {
        setUserName(profile.name);
      }

      const avgCycle = profile?.averageCycleLength || calculateAverageCycleLength(storedPeriods);
      const avgPeriod = profile?.averagePeriodLength || calculateAveragePeriodLength(storedPeriods);

      setAverageCycleLength(avgCycle);
      setAveragePeriodLength(avgPeriod);

      const cycleDay = getCurrentCycleDay(storedPeriods, avgCycle);
      const daysUntil = getDaysUntilNextPeriod(storedPeriods, avgCycle);
      const daysUntilOv = getDaysUntilOvulation(storedPeriods, avgCycle);
      const fertile = isInFertileWindow(storedPeriods, avgCycle);
      const active = getCurrentPeriod(storedPeriods);

      setCurrentCycleDay(cycleDay);
      setDaysUntilPeriod(daysUntil);
      setDaysUntilOvulation(daysUntilOv);
      setInFertileWindow(fertile);
      setActivePeriod(active);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getCycleStatus = () => {
    if (activePeriod) {
      return 'Periodo en curso';
    }
    if (inFertileWindow) {
      return 'Ventana fértil';
    }
    return 'Fase folicular';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: COLORS.backgroundPink }]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}{userName ? `, ${userName}` : ''}</Text>
            <Text style={styles.date}>
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cycle Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Estado del ciclo</Text>
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeText}>Día {currentCycleDay}</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <ProgressRing
              progress={currentCycleDay / averageCycleLength}
              size={180}
              strokeWidth={12}
              color={activePeriod ? COLORS.period : COLORS.primary}
            >
              <View style={styles.progressContent}>
                <Text style={styles.progressNumber}>{currentCycleDay}</Text>
                <Text style={styles.progressLabel}>Día del ciclo</Text>
              </View>
            </ProgressRing>
          </View>

          <View style={styles.phaseIndicator}>
            <View style={styles.phaseItem}>
              <Text style={styles.phaseLabel}>Periodo en</Text>
              <Text style={styles.phaseValue}>{daysUntilPeriod} días</Text>
            </View>
            <View style={styles.phaseDivider} />
            <View style={styles.phaseItem}>
              <Text style={styles.phaseLabel}>Ventana fértil</Text>
              <Text style={styles.phaseValue}>
                {inFertileWindow ? 'Hoy' : `${daysUntilOvulation} días`}
              </Text>
            </View>
            <View style={styles.phaseDivider} />
            <View style={styles.phaseItem}>
              <Text style={styles.phaseLabel}>Ovulación en</Text>
              <Text style={styles.phaseValue}>{daysUntilOvulation} días</Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddPeriod')}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.period }]}>
              <Ionicons name="water" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.actionText}>Periodo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('DayDetails', { date: format(new Date(), 'yyyy-MM-dd') })}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.primary }]}>
              <Ionicons name="happy-outline" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.actionText}>Humor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('DayDetails', { date: format(new Date(), 'yyyy-MM-dd') })}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.symptomsColor }]}>
              <Ionicons name="fitness-outline" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.actionText}>Síntomas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('DayDetails', { date: format(new Date(), 'yyyy-MM-dd') })}
          >
            <View style={[styles.actionIcon, { backgroundColor: COLORS.info }]}>
              <Ionicons name="heart-outline" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.actionText}>Intimidad</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.backgroundPink }]}>
              <Ionicons name="calendar" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{averageCycleLength}</Text>
            <Text style={styles.statLabel}>Promedio ciclos</Text>
            <Text style={styles.statSubLabel}>{periods.length} ciclos</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.backgroundPink }]}>
              <Ionicons name="water" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.statValue}>{averagePeriodLength} días</Text>
            <Text style={styles.statLabel}>Promedio periodos</Text>
            <Text style={styles.statSubLabel}>{periods.length} periodos</Text>
          </Card>
        </View>

        {/* Quick Log Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Registro Rápido</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Ver todo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Period Button */}
        <Button
          title={activePeriod ? 'Finalizar Periodo' : 'Registrar Periodo'}
          onPress={() => navigation.navigate('AddPeriod')}
          style={styles.addButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  greeting: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  date: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCard: {
    margin: SPACING.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statusTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dayBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  dayBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: FONT_SIZES.giant,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  progressLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  phaseIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
  },
  phaseItem: {
    alignItems: 'center',
    flex: 1,
  },
  phaseLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  phaseValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  phaseDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  statSubLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  addButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
});

export default HomeScreen;
