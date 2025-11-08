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
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import {
  getUserProfile,
  getSettings,
  saveSettings,
  exportAllData,
  clearAllData,
} from '../services/storage';
import { Settings, UserProfile } from '../types';

const SettingsScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    securityEnabled: false,
    notificationsEnabled: true,
    language: 'es',
  });

  const loadData = async () => {
    const userProfile = await getUserProfile();
    const userSettings = await getSettings();
    setProfile(userProfile);
    setSettings(userSettings);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleToggleNotifications = async (value: boolean) => {
    const newSettings = { ...settings, notificationsEnabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleToggleSecurity = async (value: boolean) => {
    const newSettings = { ...settings, securityEnabled: value };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      const jsonString = JSON.stringify(data, null, 2);
      const fileUri = FileSystem.documentDirectory + 'period_calendar_backup.json';

      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Éxito', `Datos exportados a ${fileUri}`);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron exportar los datos');
      console.error('Export error:', error);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Eliminar todos los datos',
      '¿Estás segura? Esta acción no se puede deshacer y perderás todo tu historial.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Datos eliminados', 'Todos los datos han sido eliminados');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Ajustes</Text>
        </View>

        {/* Profile Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil</Text>

          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.name || 'Usuario'}</Text>
              <Text style={styles.profileDetail}>
                Ciclo promedio: {profile?.averageCycleLength || 28} días
              </Text>
            </View>
          </View>
        </Card>

        {/* App Settings */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración</Text>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>Notificaciones</Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={settings.notificationsEnabled ? COLORS.primary : COLORS.textLight}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>Seguridad (PIN)</Text>
            </View>
            <Switch
              value={settings.securityEnabled}
              onValueChange={handleToggleSecurity}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={settings.securityEnabled ? COLORS.primary : COLORS.textLight}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>Tema oscuro</Text>
            </View>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={(value) => {
                const newSettings = { ...settings, theme: value ? 'dark' : 'light' };
                setSettings(newSettings);
                saveSettings(newSettings);
              }}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={settings.theme === 'dark' ? COLORS.primary : COLORS.textLight}
            />
          </TouchableOpacity>
        </Card>

        {/* Data Management */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Datos</Text>

          <TouchableOpacity style={styles.settingRow} onPress={handleExportData}>
            <View style={styles.settingLeft}>
              <Ionicons name="download-outline" size={24} color={COLORS.primary} />
              <Text style={styles.settingText}>Exportar datos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleClearData}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={24} color={COLORS.error} />
              <Text style={[styles.settingText, { color: COLORS.error }]}>
                Eliminar todos los datos
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </Card>

        {/* About */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca de</Text>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Versión</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>Política de privacidad</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="document-text-outline" size={24} color={COLORS.text} />
              <Text style={styles.settingText}>Términos de uso</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </Card>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Ionicons name="shield-outline" size={20} color={COLORS.primary} />
          <Text style={styles.privacyText}>
            Tus datos están 100% seguros en tu dispositivo. Esta app funciona completamente
            offline y nunca comparte tu información.
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
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES.hero,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  settingText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  aboutLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  aboutValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  privacyNotice: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundPink,
    borderRadius: BORDER_RADIUS.md,
  },
  privacyText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default SettingsScreen;
