import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Card from '../components/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { NavigationParamList, Period } from '../types';
import { addPeriod, updatePeriod, getPeriods } from '../services/storage';
import { getCurrentPeriod } from '../utils/cycleCalculations';

type AddPeriodNavigationProp = StackNavigationProp<NavigationParamList, 'AddPeriod'>;

const AddPeriodScreen: React.FC = () => {
  const navigation = useNavigation<AddPeriodNavigationProp>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [flow, setFlow] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [activePeriod, setActivePeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActivePeriod();
  }, []);

  const loadActivePeriod = async () => {
    const periods = await getPeriods();
    const active = getCurrentPeriod(periods);
    setActivePeriod(active);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (activePeriod) {
        // End current period
        await updatePeriod(activePeriod.id, {
          endDate: format(selectedDate, 'yyyy-MM-dd'),
        });
        Alert.alert('Éxito', 'Periodo finalizado correctamente');
      } else {
        // Start new period
        const newPeriod: Period = {
          id: Date.now().toString(),
          startDate: format(selectedDate, 'yyyy-MM-dd'),
          flow,
        };
        await addPeriod(newPeriod);
        Alert.alert('Éxito', 'Periodo registrado correctamente');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el periodo');
      console.error('Error saving period:', error);
    } finally {
      setLoading(false);
    }
  };

  const flowOptions = [
    { value: 'light', label: 'Ligero', icon: 'water-outline', color: COLORS.info },
    { value: 'medium', label: 'Normal', icon: 'water', color: COLORS.primary },
    { value: 'heavy', label: 'Abundante', icon: 'water', color: COLORS.error },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <Text style={styles.title}>
            {activePeriod ? 'Finalizar Periodo' : 'Registrar Periodo'}
          </Text>

          <Text style={styles.label}>Fecha</Text>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
            </Text>
            <View style={styles.dateButtons}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 1);
                  setSelectedDate(newDate);
                }}
              >
                <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setSelectedDate(new Date())}
              >
                <Text style={styles.dateButtonText}>Hoy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 1);
                  setSelectedDate(newDate);
                }}
              >
                <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {!activePeriod && (
            <>
              <Text style={styles.label}>Flujo menstrual</Text>
              <View style={styles.flowOptions}>
                {flowOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.flowOption,
                      flow === option.value && styles.flowOptionActive,
                      { borderColor: option.color },
                    ]}
                    onPress={() => setFlow(option.value as typeof flow)}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={32}
                      color={flow === option.value ? COLORS.white : option.color}
                    />
                    <Text
                      style={[
                        styles.flowOptionText,
                        flow === option.value && styles.flowOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {activePeriod && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color={COLORS.info} />
              <Text style={styles.infoText}>
                Iniciaste tu periodo el{' '}
                {format(new Date(activePeriod.startDate), "d 'de' MMMM", { locale: es })}
              </Text>
            </View>
          )}
        </Card>

        <Button
          title={activePeriod ? 'Finalizar Periodo' : 'Guardar Periodo'}
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
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
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  dateButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'center',
  },
  dateButton: {
    backgroundColor: COLORS.backgroundPink,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  flowOptions: {
    gap: SPACING.md,
  },
  flowOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundPink,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: SPACING.md,
  },
  flowOptionActive: {
    backgroundColor: COLORS.primary,
  },
  flowOptionText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  flowOptionTextActive: {
    color: COLORS.white,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundPink,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.lg,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
});

export default AddPeriodScreen;
