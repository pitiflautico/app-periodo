import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { differenceInDays, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import Card from '../components/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { Period } from '../types';
import { getPeriods, getUserProfile } from '../services/storage';
import {
  calculateAverageCycleLength,
  calculateAveragePeriodLength,
} from '../utils/cycleCalculations';

const StatisticsScreen: React.FC = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [averageCycleLength, setAverageCycleLength] = useState(28);
  const [averagePeriodLength, setAveragePeriodLength] = useState(5);
  const [longestCycle, setLongestCycle] = useState(0);
  const [shortestCycle, setShortestCycle] = useState(0);

  const loadData = async () => {
    try {
      const storedPeriods = await getPeriods();
      const profile = await getUserProfile();

      setPeriods(storedPeriods);

      const avgCycle = profile?.averageCycleLength || calculateAverageCycleLength(storedPeriods);
      const avgPeriod = profile?.averagePeriodLength || calculateAveragePeriodLength(storedPeriods);

      setAverageCycleLength(avgCycle);
      setAveragePeriodLength(avgPeriod);

      // Calculate longest and shortest cycles
      if (storedPeriods.length >= 2) {
        const sortedPeriods = [...storedPeriods].sort((a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

        const cycleLengths: number[] = [];
        for (let i = 1; i < sortedPeriods.length; i++) {
          const days = differenceInDays(
            parseISO(sortedPeriods[i].startDate),
            parseISO(sortedPeriods[i - 1].startDate)
          );
          if (days > 0 && days < 45) {
            cycleLengths.push(days);
          }
        }

        if (cycleLengths.length > 0) {
          setLongestCycle(Math.max(...cycleLengths));
          setShortestCycle(Math.min(...cycleLengths));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getRegularityStatus = () => {
    if (periods.length < 3) return 'Insuficientes datos';

    const variance = longestCycle - shortestCycle;
    if (variance <= 3) return 'Muy regular';
    if (variance <= 7) return 'Regular';
    if (variance <= 14) return 'Algo irregular';
    return 'Irregular';
  };

  const getRegularityColor = () => {
    const status = getRegularityStatus();
    if (status === 'Muy regular' || status === 'Regular') return COLORS.success;
    if (status === 'Algo irregular') return COLORS.warning;
    return COLORS.error;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Estadísticas</Text>
        </View>

        {/* Main Stats */}
        <Card style={styles.mainStatsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{averageCycleLength}</Text>
              <Text style={styles.statLabel}>Duración promedio del ciclo</Text>
              <Text style={styles.statSubLabel}>días</Text>
            </View>
          </View>
        </Card>

        {/* Cycle Stats */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Detalles del ciclo</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ciclo más corto</Text>
            <Text style={styles.detailValue}>
              {shortestCycle > 0 ? `${shortestCycle} días` : '-'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ciclo más largo</Text>
            <Text style={styles.detailValue}>
              {longestCycle > 0 ? `${longestCycle} días` : '-'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Variación</Text>
            <Text style={styles.detailValue}>
              {longestCycle > 0 ? `±${longestCycle - shortestCycle} días` : '-'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Regularidad</Text>
            <View style={[styles.statusBadge, { backgroundColor: getRegularityColor() }]}>
              <Text style={styles.statusText}>{getRegularityStatus()}</Text>
            </View>
          </View>
        </Card>

        {/* Period Stats */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Detalles del periodo</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duración promedio</Text>
            <Text style={styles.detailValue}>{averagePeriodLength} días</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Periodos registrados</Text>
            <Text style={styles.detailValue}>{periods.length}</Text>
          </View>
        </Card>

        {/* Recent History */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Historial reciente</Text>

          {periods.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay periodos registrados aún
            </Text>
          ) : (
            <View style={styles.historyList}>
              {periods
                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                .slice(0, 5)
                .map((period) => (
                  <View key={period.id} style={styles.historyItem}>
                    <View style={styles.historyDot} />
                    <View style={styles.historyContent}>
                      <Text style={styles.historyDate}>
                        {format(parseISO(period.startDate), "d 'de' MMMM, yyyy", {
                          locale: es,
                        })}
                      </Text>
                      {period.endDate && (
                        <Text style={styles.historyDuration}>
                          Duración:{' '}
                          {differenceInDays(
                            parseISO(period.endDate),
                            parseISO(period.startDate)
                          )}{' '}
                          días
                        </Text>
                      )}
                      {period.flow && (
                        <Text style={styles.historyFlow}>
                          Flujo: {period.flow === 'light' ? 'Ligero' : period.flow === 'medium' ? 'Normal' : 'Abundante'}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
            </View>
          )}
        </Card>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Las estadísticas se vuelven más precisas con más datos registrados.
            Se recomienda al menos 3 ciclos completos para mejores predicciones.
          </Text>
        </View>
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
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.hero,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mainStatsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  statRow: {
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  statSubLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    opacity: 0.8,
  },
  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  historyList: {
    gap: SPACING.md,
  },
  historyItem: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  historyDot: {
    width: 12,
    height: 12,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  historyDuration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  historyFlow: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  infoBox: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundPink,
    borderRadius: BORDER_RADIUS.md,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default StatisticsScreen;
