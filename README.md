# 🩸 Period Calendar - Offline Menstrual Tracker

Una aplicación móvil **100% offline y privada** para el seguimiento del ciclo menstrual, desarrollada con React Native y Expo.

## 🎯 Características Principales

- **100% Offline y Privada**: Todos los datos se almacenan únicamente en tu dispositivo
- **Predicción de Ciclos**: Algoritmos inteligentes para predecir tu próximo periodo y ovulación
- **Seguimiento Completo**: Registra periodo, síntomas, estado de ánimo y más
- **Recordatorios Locales**: Notificaciones sin conexión para recordatorios importantes
- **Estadísticas Detalladas**: Analiza tus patrones y regularidad del ciclo
- **Diseño Intuitivo**: Interfaz moderna siguiendo las mejores prácticas de UX/UI
- **Multiplataforma**: Compatible con iOS y Android

## 📱 Pantallas Implementadas

### 1. Onboarding
- Introducción a la app
- Configuración inicial del perfil
- Configuración de periodo y ciclo promedio
- Activación de recordatorios

### 2. Pantalla Principal (Home)
- Estado del ciclo actual
- Anillo de progreso del ciclo
- Días hasta próximo periodo/ovulación
- Accesos rápidos para registro

### 3. Calendario
- Vista mensual con código de colores
- Indicadores de periodo, días fértiles, ovulación
- Navegación entre meses
- Leyenda explicativa

### 4. Registro de Periodo
- Marcar inicio/fin de periodo
- Selección de intensidad de flujo
- Interfaz simple e intuitiva

### 5. Detalles del Día
- Registro de estado de ánimo
- Registro de síntomas
- Intensidad de flujo
- Actividad sexual

### 6. Estadísticas
- Promedio de duración del ciclo
- Promedio de duración del periodo
- Regularidad del ciclo
- Historial reciente

### 7. Recordatorios
- Gestión de recordatorios
- Tipos: píldora, periodo, ovulación, personalizado
- Configuración de frecuencia y horario

### 8. Ajustes
- Perfil de usuario
- Configuración de notificaciones
- Seguridad (PIN/biométrico)
- Tema claro/oscuro
- Exportación de datos
- Política de privacidad

## 🎨 Diseño

La aplicación sigue un diseño moderno con:
- Paleta de colores rosa/coral (#FF8FA3, #FF6B9D)
- Gradientes suaves
- Tarjetas redondeadas
- Iconografía clara con Ionicons
- Animaciones fluidas

## 🔧 Tecnologías Utilizadas

- **React Native**: Framework principal
- **Expo**: Plataforma de desarrollo y build
- **TypeScript**: Tipado estático
- **React Navigation**: Navegación (Stack + Bottom Tabs)
- **AsyncStorage**: Almacenamiento local offline
- **Expo Notifications**: Notificaciones locales
- **date-fns**: Manejo de fechas
- **react-native-svg**: Gráficos vectoriales
- **expo-linear-gradient**: Gradientes
- **Google Mobile Ads**: Publicidad (AdMob)

## 📦 Instalación y Desarrollo

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Expo CLI
- iOS Simulator (para desarrollo iOS) o Android Studio (para Android)

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd app-periodo

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start

# Para iOS
npm run ios

# Para Android
npm run android
```

## 📂 Estructura del Proyecto

```
app-periodo/
├── App.tsx                      # Punto de entrada principal
├── app.json                     # Configuración de Expo
├── package.json                 # Dependencias
├── assets/                      # Recursos (iconos, imágenes)
├── design-ux-styles/           # Diseños de referencia
└── src/
    ├── components/             # Componentes reutilizables
    │   ├── Button.tsx
    │   ├── Card.tsx
    │   ├── Header.tsx
    │   ├── GradientBackground.tsx
    │   ├── ProgressRing.tsx
    │   └── AdBanner.tsx
    ├── constants/              # Constantes (colores, tema)
    │   ├── colors.ts
    │   └── theme.ts
    ├── navigation/             # Configuración de navegación
    │   └── AppNavigator.tsx
    ├── screens/                # Pantallas de la app
    │   ├── OnboardingScreen.tsx
    │   ├── HomeScreen.tsx
    │   ├── CalendarScreen.tsx
    │   ├── AddPeriodScreen.tsx
    │   ├── DayDetailsScreen.tsx
    │   ├── StatisticsScreen.tsx
    │   ├── RemindersScreen.tsx
    │   └── SettingsScreen.tsx
    ├── services/               # Servicios (storage, notificaciones, ads)
    │   ├── storage.ts
    │   ├── notifications.ts
    │   └── adsManager.ts
    ├── types/                  # Tipos TypeScript
    │   └── index.ts
    └── utils/                  # Utilidades
        └── cycleCalculations.ts
```

## 💰 Estrategia de Publicidad

La app implementa Google AdMob de forma **no intrusiva** siguiendo las mejores prácticas:

### Ubicación de Anuncios
- ✅ **Banners**: Solo en pantallas de Estadísticas y Ajustes
- ❌ **NO** en pantallas de registro de datos
- ❌ **NO** en Onboarding
- ❌ **NO** durante entrada de síntomas o periodo

### Frecuencia
- Control de frecuencia: máximo 3 anuncios por sesión (modo conservador)
- Tiempo mínimo entre anuncios: 5 minutos
- Los anuncios **nunca** interrumpen la funcionalidad principal

### Compliance
- Clasificación de contenido: G (General Audiences)
- Sin publicidad dirigida a menores
- Cumplimiento con GDPR y políticas de privacidad
- Anuncios no personalizados por defecto

### IDs de Prueba
Durante el desarrollo se usan Test IDs de Google:
```typescript
BANNER: TestIds.BANNER
INTERSTITIAL: TestIds.INTERSTITIAL
```

**IMPORTANTE**: Antes de publicar, reemplaza con tus IDs reales de AdMob en `src/services/adsManager.ts`

## 🔒 Privacidad y Seguridad

- **100% Offline**: Sin servidores, sin sincronización cloud
- **Datos locales**: Todo se almacena en AsyncStorage del dispositivo
- **Sin tracking**: No se recopilan datos de usuario
- **Seguridad opcional**: PIN o biometría para proteger la app
- **Exportación**: Los usuarios pueden exportar sus datos en JSON

## 📊 Algoritmos de Predicción

### Predicción de Ciclos
```typescript
// Calcula el promedio de ciclos anteriores
averageCycleLength = sum(cycleLengths) / count

// Predice próximo periodo
nextPeriod = lastPeriodStart + averageCycleLength
```

### Predicción de Ovulación
```typescript
// Típicamente 14 días antes del próximo periodo
ovulationDay = nextPeriod - 14 días

// Ventana fértil: 5 días antes de ovulación
fertileWindow = [ovulationDay - 5, ovulationDay]
```

## 🚀 Deployment

### Preparación para Publicación

1. **Actualizar IDs de Publicidad**
   ```typescript
   // En src/services/adsManager.ts
   export const AD_UNIT_IDS = {
     BANNER: 'ca-app-pub-XXXXXXXX/YYYYYYYYYY',
     INTERSTITIAL: 'ca-app-pub-XXXXXXXX/ZZZZZZZZZZ',
   };
   ```

2. **Configurar app.json**
   - Actualizar `bundleIdentifier` (iOS)
   - Actualizar `package` (Android)
   - Configurar iconos y splash screens

3. **Build para iOS**
   ```bash
   eas build --platform ios
   ```

4. **Build para Android**
   ```bash
   eas build --platform android
   ```

### Checklist antes de Publicar

- [ ] Reemplazar Test IDs de AdMob con IDs reales
- [ ] Agregar iconos personalizados (1024x1024 para iOS, varios tamaños para Android)
- [ ] Crear splash screen personalizado
- [ ] Revisar y actualizar política de privacidad
- [ ] Revisar permisos en app.json
- [ ] Probar en dispositivos físicos (iOS y Android)
- [ ] Verificar que ads no interfieren con funcionalidad core
- [ ] Revisar compliance con App Store y Google Play policies

## 📝 Políticas de las Tiendas

### iOS App Store
- ✅ Funcionalidad mínima cumplida (no solo wrapper de ads)
- ✅ Los ads no interfieren con la funcionalidad principal
- ✅ Privacidad respetada (datos locales únicamente)
- ✅ Contenido apropiado para salud femenina

### Google Play Store
- ✅ Cumplimiento con políticas de datos de usuario
- ✅ Ads apropiados (MaxAdContentRating.G)
- ✅ Sin recopilación de datos sensibles
- ✅ Declaración de permisos transparente

## 🤝 Contribuciones

Este proyecto está diseñado para ser mantenible y extensible. Áreas para futuras mejoras:

- [ ] Gráficas más avanzadas (charts con Victory Native)
- [ ] Exportación a PDF además de JSON
- [ ] Backup cifrado en iCloud/Google Drive (opcional)
- [ ] Widgets para pantalla de inicio
- [ ] Soporte para múltiples idiomas
- [ ] Integración con Apple Health / Google Fit
- [ ] Modo oscuro mejorado con animaciones

## 📄 Licencia

Este proyecto es propiedad privada. Todos los derechos reservados.

## 🩺 Disclaimer

Esta aplicación es solo para fines informativos y de seguimiento personal. No sustituye el consejo médico profesional. Consulta con tu médico para cualquier preocupación de salud.

---

Desarrollado con ❤️ para proporcionar privacidad y control total sobre tus datos de salud menstrual.
