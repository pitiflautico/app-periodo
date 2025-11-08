import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import GradientBackground from '../components/GradientBackground';
import Button from '../components/Button';
import Card from '../components/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { NavigationParamList, UserProfile } from '../types';
import { saveUserProfile, setOnboardingCompleted } from '../services/storage';

type OnboardingNavigationProp = StackNavigationProp<NavigationParamList, 'Onboarding'>;

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const [step, setStep] = useState(0);
  const [lastPeriodDate, setLastPeriodDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [periodLength, setPeriodLength] = useState(5);
  const [cycleLength, setCycleLength] = useState(28);
  const [enableReminders, setEnableReminders] = useState(true);

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save profile and complete onboarding
      const profile: UserProfile = {
        lastPeriodDate,
        averagePeriodLength: periodLength,
        averageCycleLength: cycleLength,
        firstTimeUser: false,
      };

      await saveUserProfile(profile);
      await setOnboardingCompleted(true);

      navigation.replace('Main');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Card style={styles.card}>
            <Text style={styles.stepTitle}>¡Bienvenida! 🩸</Text>
            <Text style={styles.stepDescription}>
              Period Calendar es tu calendario menstrual 100% offline y privado.
            </Text>
            <Text style={styles.stepDescription}>
              Tus datos están solo en tu dispositivo, nunca se comparten.
            </Text>
            <View style={styles.features}>
              <Text style={styles.feature}>✓ 100% privado y offline</Text>
              <Text style={styles.feature}>✓ Predicción de ciclos</Text>
              <Text style={styles.feature}>✓ Recordatorios locales</Text>
              <Text style={styles.feature}>✓ Seguimiento de síntomas</Text>
            </View>
          </Card>
        );

      case 1:
        return (
          <Card style={styles.card}>
            <Text style={styles.stepTitle}>¿Cuándo comenzó tu último periodo?</Text>
            <Text style={styles.stepDescription}>
              Esto nos ayudará a hacer mejores predicciones
            </Text>

            <View style={styles.dateSelector}>
              <Text style={styles.selectedDate}>
                {format(new Date(lastPeriodDate), "d 'de' MMMM, yyyy", { locale: es })}
              </Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setLastPeriodDate(format(subDays(new Date(lastPeriodDate), 1), 'yyyy-MM-dd'))}
              >
                <Text style={styles.dateButtonText}>← Día anterior</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setLastPeriodDate(format(new Date(), 'yyyy-MM-dd'))}
              >
                <Text style={styles.dateButtonText}>Hoy</Text>
              </TouchableOpacity>
            </View>
          </Card>
        );

      case 2:
        return (
          <Card style={styles.card}>
            <Text style={styles.stepTitle}>Duración de tu periodo</Text>
            <Text style={styles.stepDescription}>
              ¿Cuántos días dura normalmente tu periodo?
            </Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{periodLength} días</Text>
              <View style={styles.sliderButtons}>
                {[3, 4, 5, 6, 7, 8].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.sliderButton,
                      periodLength === days && styles.sliderButtonActive,
                    ]}
                    onPress={() => setPeriodLength(days)}
                  >
                    <Text
                      style={[
                        styles.sliderButtonText,
                        periodLength === days && styles.sliderButtonTextActive,
                      ]}
                    >
                      {days}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={[styles.stepTitle, { marginTop: SPACING.xl }]}>
              Duración de tu ciclo
            </Text>
            <Text style={styles.stepDescription}>
              ¿Cuántos días entre periodos?
            </Text>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderValue}>{cycleLength} días</Text>
              <View style={styles.sliderButtons}>
                {[21, 24, 28, 30, 35, 40].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.sliderButton,
                      cycleLength === days && styles.sliderButtonActive,
                    ]}
                    onPress={() => setCycleLength(days)}
                  >
                    <Text
                      style={[
                        styles.sliderButtonText,
                        cycleLength === days && styles.sliderButtonTextActive,
                      ]}
                    >
                      {days}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        );

      case 3:
        return (
          <Card style={styles.card}>
            <Text style={styles.stepTitle}>¿Activar recordatorios?</Text>
            <Text style={styles.stepDescription}>
              Recibe notificaciones locales para tu periodo y ovulación
            </Text>

            <View style={styles.switchContainer}>
              <TouchableOpacity
                style={[
                  styles.switchOption,
                  enableReminders && styles.switchOptionActive,
                ]}
                onPress={() => setEnableReminders(true)}
              >
                <Text
                  style={[
                    styles.switchOptionText,
                    enableReminders && styles.switchOptionTextActive,
                  ]}
                >
                  Sí, activar recordatorios
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.switchOption,
                  !enableReminders && styles.switchOptionActive,
                ]}
                onPress={() => setEnableReminders(false)}
              >
                <Text
                  style={[
                    styles.switchOptionText,
                    !enableReminders && styles.switchOptionTextActive,
                  ]}
                >
                  No, por ahora
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>🩸</Text>
            <Text style={styles.title}>Period Calendar</Text>
          </View>

          <View style={styles.progressContainer}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i <= step && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {renderStep()}

          <View style={styles.buttonContainer}>
            {step > 0 && (
              <Button
                title="Anterior"
                onPress={() => setStep(step - 1)}
                variant="outline"
                style={styles.button}
              />
            )}
            <Button
              title={step === 3 ? 'Comenzar' : 'Siguiente'}
              onPress={handleNext}
              style={[styles.button, { flex: 1 }]}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.hero,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  progressDot: {
    width: 40,
    height: 6,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.white,
    opacity: 0.3,
  },
  progressDotActive: {
    opacity: 1,
  },
  card: {
    flex: 1,
    marginBottom: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  stepDescription: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 24,
  },
  features: {
    marginTop: SPACING.lg,
  },
  feature: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  dateSelector: {
    marginTop: SPACING.lg,
  },
  selectedDate: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  dateButton: {
    backgroundColor: COLORS.backgroundPink,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  dateButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  sliderContainer: {
    marginTop: SPACING.lg,
  },
  sliderValue: {
    fontSize: FONT_SIZES.hero,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  sliderButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  sliderButton: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sliderButtonText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.primary,
  },
  sliderButtonTextActive: {
    color: COLORS.white,
  },
  switchContainer: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  switchOption: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundPink,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  switchOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  switchOptionText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  switchOptionTextActive: {
    color: COLORS.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: 'auto',
  },
  button: {
    minWidth: 100,
  },
});

export default OnboardingScreen;
