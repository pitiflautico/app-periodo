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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import Card from '../components/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { NavigationParamList, DailyLog } from '../types';
import { addDailyLog, getDailyLog } from '../services/storage';

type DayDetailsRouteProp = RouteProp<NavigationParamList, 'DayDetails'>;

const DayDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<DayDetailsRouteProp>();
  const { date } = route.params;

  const [mood, setMood] = useState<DailyLog['mood']>();
  const [flow, setFlow] = useState<DailyLog['flow']>();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [sexualActivity, setSexualActivity] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDailyLog();
  }, [date]);

  const loadDailyLog = async () => {
    const log = await getDailyLog(date);
    if (log) {
      setMood(log.mood);
      setFlow(log.flow);
      setSelectedSymptoms(log.symptoms || []);
      setSexualActivity(log.sexualActivity || false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const log: DailyLog = {
        date,
        mood,
        flow,
        symptoms: selectedSymptoms,
        sexualActivity,
      };
      await addDailyLog(log);
      Alert.alert('Éxito', 'Datos guardados correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los datos');
      console.error('Error saving daily log:', error);
    } finally {
      setLoading(false);
    }
  };

  const moods = [
    { value: 'happy', label: 'Feliz', emoji: '😊' },
    { value: 'calm', label: 'Tranquila', emoji: '😌' },
    { value: 'anxious', label: 'Ansiosa', emoji: '😰' },
    { value: 'angry', label: 'Enojada', emoji: '😠' },
    { value: 'sad', label: 'Triste', emoji: '😢' },
    { value: 'confused', label: 'Confundida', emoji: '😕' },
    { value: 'sleepy', label: 'Somnolienta', emoji: '😴' },
    { value: 'distracted', label: 'Distraída', emoji: '🤔' },
  ];

  const flows = [
    { value: 'light', label: 'Ligero', icon: 'water-outline' },
    { value: 'medium', label: 'Medio', icon: 'water' },
    { value: 'heavy', label: 'Abundante', icon: 'water' },
  ];

  const symptoms = [
    'Cólicos',
    'Dolor de cabeza',
    'Acné',
    'Sensibilidad en senos',
    'Náuseas',
    'Hinchazón',
    'Fatiga',
    'Antojos',
    'Insomnio',
    'Dolor de espalda',
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.dateTitle}>
          {format(new Date(date), "d 'de' MMMM, yyyy", { locale: es })}
        </Text>

        {/* Mood Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de ánimo</Text>
          <View style={styles.moodGrid}>
            {moods.map((moodOption) => (
              <TouchableOpacity
                key={moodOption.value}
                style={[
                  styles.moodOption,
                  mood === moodOption.value && styles.moodOptionActive,
                ]}
                onPress={() => setMood(moodOption.value as DailyLog['mood'])}
              >
                <Text style={styles.moodEmoji}>{moodOption.emoji}</Text>
                <Text style={styles.moodLabel}>{moodOption.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Flow Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Flujo menstrual</Text>
          <View style={styles.flowGrid}>
            {flows.map((flowOption) => (
              <TouchableOpacity
                key={flowOption.value}
                style={[
                  styles.flowOption,
                  flow === flowOption.value && styles.flowOptionActive,
                ]}
                onPress={() => setFlow(flowOption.value as DailyLog['flow'])}
              >
                <Ionicons
                  name={flowOption.icon as any}
                  size={32}
                  color={flow === flowOption.value ? COLORS.white : COLORS.primary}
                />
                <Text
                  style={[
                    styles.flowLabel,
                    flow === flowOption.value && styles.flowLabelActive,
                  ]}
                >
                  {flowOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Symptoms Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Síntomas</Text>
          <View style={styles.symptomsGrid}>
            {symptoms.map((symptom) => (
              <TouchableOpacity
                key={symptom}
                style={[
                  styles.symptomChip,
                  selectedSymptoms.includes(symptom) && styles.symptomChipActive,
                ]}
                onPress={() => toggleSymptom(symptom)}
              >
                <Text
                  style={[
                    styles.symptomText,
                    selectedSymptoms.includes(symptom) && styles.symptomTextActive,
                  ]}
                >
                  {symptom}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Sexual Activity */}
        <Card style={styles.section}>
          <TouchableOpacity
            style={styles.activityRow}
            onPress={() => setSexualActivity(!sexualActivity)}
          >
            <View style={styles.activityLeft}>
              <Ionicons name="heart" size={24} color={COLORS.primary} />
              <Text style={styles.activityText}>Actividad sexual</Text>
            </View>
            <View
              style={[
                styles.checkbox,
                sexualActivity && styles.checkboxActive,
              ]}
            >
              {sexualActivity && (
                <Ionicons name="checkmark" size={20} color={COLORS.white} />
              )}
            </View>
          </TouchableOpacity>
        </Card>

        <Button
          title="Guardar"
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
  dateTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  moodOption: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: COLORS.backgroundPink,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
  },
  moodOptionActive: {
    backgroundColor: COLORS.primary,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    textAlign: 'center',
  },
  flowGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  flowOption: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.backgroundPink,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  flowOptionActive: {
    backgroundColor: COLORS.primary,
  },
  flowLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  flowLabelActive: {
    color: COLORS.white,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  symptomChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundPink,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  symptomChipActive: {
    backgroundColor: COLORS.symptomsColor,
    borderColor: COLORS.symptomsColor,
  },
  symptomText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  symptomTextActive: {
    color: COLORS.white,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  activityText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  saveButton: {
    marginTop: SPACING.lg,
  },
});

export default DayDetailsScreen;
