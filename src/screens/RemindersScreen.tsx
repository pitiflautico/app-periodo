import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Button from '../components/Button';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { Reminder } from '../types';
import { getReminders, updateReminder, deleteReminder, addReminder } from '../services/storage';

const RemindersScreen: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const loadReminders = async () => {
    const data = await getReminders();
    setReminders(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [])
  );

  const handleToggle = async (reminderId: string, enabled: boolean) => {
    await updateReminder(reminderId, { enabled });
    loadReminders();
  };

  const handleDelete = async (reminderId: string) => {
    Alert.alert(
      'Eliminar recordatorio',
      '¿Estás segura de que quieres eliminar este recordatorio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteReminder(reminderId);
            loadReminders();
          },
        },
      ]
    );
  };

  const handleAddReminder = async () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      type: 'custom',
      title: 'Nuevo recordatorio',
      time: '09:00',
      frequency: 'daily',
      enabled: true,
    };
    await addReminder(newReminder);
    loadReminders();
  };

  const getTypeIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'pill':
        return 'medical';
      case 'period':
        return 'water';
      case 'ovulation':
        return 'flower';
      default:
        return 'notifications';
    }
  };

  const getTypeLabel = (type: Reminder['type']) => {
    switch (type) {
      case 'pill':
        return 'Píldora';
      case 'period':
        return 'Periodo';
      case 'ovulation':
        return 'Ovulación';
      default:
        return 'Personalizado';
    }
  };

  const getFrequencyLabel = (frequency: Reminder['frequency']) => {
    switch (frequency) {
      case 'daily':
        return 'Diario';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensual';
      default:
        return 'Personalizado';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {reminders.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="notifications-off" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Sin recordatorios</Text>
            <Text style={styles.emptyText}>
              Agrega recordatorios para recibir notificaciones sobre tu periodo, ovulación o
              medicamentos.
            </Text>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderHeader}>
                <View style={styles.reminderLeft}>
                  <View
                    style={[
                      styles.reminderIcon,
                      { backgroundColor: reminder.enabled ? COLORS.primary : COLORS.border },
                    ]}
                  >
                    <Ionicons
                      name={getTypeIcon(reminder.type) as any}
                      size={24}
                      color={reminder.enabled ? COLORS.white : COLORS.textLight}
                    />
                  </View>
                  <View style={styles.reminderInfo}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <Text style={styles.reminderSubtitle}>
                      {getTypeLabel(reminder.type)} • {getFrequencyLabel(reminder.frequency)}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={reminder.enabled}
                  onValueChange={(value) => handleToggle(reminder.id, value)}
                  trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
                  thumbColor={reminder.enabled ? COLORS.primary : COLORS.textLight}
                />
              </View>

              <View style={styles.reminderDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{reminder.time}</Text>
                </View>
              </View>

              <View style={styles.reminderActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(reminder.id)}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                  <Text style={[styles.actionText, { color: COLORS.error }]}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}

        <Button
          title="Agregar Recordatorio"
          onPress={handleAddReminder}
          style={styles.addButton}
        />

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.info} />
          <Text style={styles.infoText}>
            Los recordatorios se envían como notificaciones locales. Asegúrate de tener los
            permisos de notificaciones activados.
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
    padding: SPACING.lg,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  reminderCard: {
    marginBottom: SPACING.md,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  reminderIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  reminderSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reminderDetails: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  reminderActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  addButton: {
    marginTop: SPACING.lg,
  },
  infoBox: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundPink,
    borderRadius: BORDER_RADIUS.md,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default RemindersScreen;
