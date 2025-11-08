# Guía de Deployment - Period Calendar

Esta guía te ayudará a preparar y publicar la aplicación en App Store (iOS) y Google Play Store (Android).

## Pre-requisitos

1. **Cuenta de Desarrollador**
   - Apple Developer Program ($99/año)
   - Google Play Developer ($25 pago único)

2. **Configuración de Expo**
   ```bash
   npm install -g eas-cli
   eas login
   ```

3. **Google AdMob**
   - Crear cuenta en https://admob.google.com/
   - Crear una aplicación para iOS y otra para Android
   - Obtener App IDs y Ad Unit IDs

## Paso 1: Configurar AdMob

### 1.1 Obtener IDs de AdMob

1. Ve a https://apps.admob.com/
2. Crea una app para iOS y otra para Android
3. Para cada plataforma, crea:
   - Banner Ad Unit
   - (Opcional) Interstitial Ad Unit

### 1.2 Actualizar Código

En `src/services/adsManager.ts`:

```typescript
export const AD_UNIT_IDS = {
  BANNER: 'ca-app-pub-XXXXXXXX/YYYYYYYYYY', // Tu ID real
  INTERSTITIAL: 'ca-app-pub-XXXXXXXX/ZZZZZZZZZZ', // Tu ID real
};
```

En `app.json`:

```json
"plugins": [
  [
    "react-native-google-mobile-ads",
    {
      "androidAppId": "ca-app-pub-XXXXXXXX~YYYYYYYYYY",
      "iosAppId": "ca-app-pub-XXXXXXXX~ZZZZZZZZZZ"
    }
  ]
]
```

## Paso 2: Preparar Assets

### 2.1 Icono de la App (1024x1024 PNG)

Crea un icono cuadrado de 1024x1024 píxeles y colócalo en:
- `assets/icon.png`

Herramientas recomendadas:
- Figma
- Adobe Illustrator
- Canva

### 2.2 Splash Screen (1284x2778 PNG)

Crea una pantalla de carga y colócala en:
- `assets/splash.png`

### 2.3 Adaptive Icon (Android)

Para Android, crea un icono adaptativo:
- `assets/adaptive-icon.png`

## Paso 3: Configurar app.json

```json
{
  "expo": {
    "name": "Period Calendar",
    "slug": "period-calendar",
    "version": "1.0.0",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#FF8FA3"
    },
    "ios": {
      "bundleIdentifier": "com.tuempresa.periodcalendar",
      "buildNumber": "1",
      "supportsTablet": true
    },
    "android": {
      "package": "com.tuempresa.periodcalendar",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FF8FA3"
      }
    }
  }
}
```

## Paso 4: Metadatos de las Tiendas

### 4.1 Descripción de la App (App Store & Google Play)

**Título**: Period Calendar - Seguimiento Menstrual Offline

**Subtítulo** (App Store): Tu ciclo menstrual 100% privado y offline

**Descripción Corta** (Google Play):
```
Seguimiento menstrual completamente offline y privado. Predice tu ciclo, registra síntomas y mantén el control total de tus datos de salud.
```

**Descripción Completa**:
```
🩸 Period Calendar - Tu Calendario Menstrual 100% Privado

Period Calendar es la única aplicación de seguimiento menstrual completamente offline. Tus datos NUNCA salen de tu dispositivo.

✨ CARACTERÍSTICAS PRINCIPALES:

• 100% Offline y Privado
  - Cero servidores, cero sincronización cloud
  - Tus datos solo en tu dispositivo
  - Sin recopilación de información personal

• Predicción Inteligente
  - Predice tu próximo periodo con precisión
  - Calcula tu ventana fértil y ovulación
  - Analiza patrones de regularidad

• Seguimiento Completo
  - Registra periodos con intensidad de flujo
  - Síntomas físicos y emocionales
  - Estados de ánimo
  - Actividad sexual

• Recordatorios Locales
  - Notificaciones para periodo y ovulación
  - Recordatorios de medicación
  - Todo procesado localmente

• Estadísticas Detalladas
  - Promedio de ciclos y periodos
  - Análisis de regularidad
  - Historial completo

• Exportación de Datos
  - Exporta tu historial a JSON/CSV
  - Tú decides qué hacer con tus datos
  - Sin dependencia de servicios externos

🔒 PRIVACIDAD GARANTIZADA:

Entendemos que tus datos de salud menstrual son extremadamente privados. Por eso:
- NO recopilamos información
- NO tenemos servidores
- NO rastreamos tu actividad
- NO compartimos con terceros
- Control 100% en tus manos

📊 IDEAL PARA:

• Seguimiento de ciclo menstrual regular
• Planificación familiar natural
• Identificación de patrones
• Consultas médicas (exporta tu historial)
• Tranquilidad y privacidad total

⚕️ NOTA MÉDICA:

Esta app es para seguimiento personal. No sustituye consejo médico profesional. Consulta a tu médico para diagnósticos o tratamientos.

---

Descarga Period Calendar y recupera el control de tu privacidad menstrual hoy.
```

### 4.2 Palabras Clave (App Store)

```
periodo, menstruacion, ciclo, ovulacion, fertilidad, calendario, tracker, salud, mujer, privado, offline, seguro
```

### 4.3 Capturas de Pantalla

Necesitas preparar capturas para cada tamaño de dispositivo:

**iOS**:
- iPhone 6.7" (1290 x 2796) - iPhone 14 Pro Max
- iPhone 6.5" (1242 x 2688) - iPhone 11 Pro Max
- iPhone 5.5" (1242 x 2208) - iPhone 8 Plus
- iPad Pro 12.9" (2048 x 2732)

**Android**:
- Teléfono (1080 x 1920 o similar)
- Tablet de 7" (1200 x 1920 o similar)
- Tablet de 10" (1600 x 2560 o similar)

Capturas recomendadas (orden):
1. Pantalla principal (Home) mostrando el estado del ciclo
2. Calendario con colores
3. Pantalla de estadísticas
4. Configuración/Ajustes con énfasis en privacidad

## Paso 5: Build con EAS

### 5.1 Configurar eas.json

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "bundler": "metro"
      }
    }
  }
}
```

### 5.2 Build iOS

```bash
# Configurar proyecto
eas build:configure

# Build para App Store
eas build --platform ios --profile production

# Enviar a App Store
eas submit --platform ios
```

### 5.3 Build Android

```bash
# Build para Google Play
eas build --platform android --profile production

# Enviar a Google Play
eas submit --platform android
```

## Paso 6: Compliance Checklist

### iOS App Store Review

- [ ] **Funcionalidad Mínima**: La app tiene funcionalidad sustancial más allá de solo mostrar ads
- [ ] **Privacidad**: Privacy Policy implementada y accesible
- [ ] **Datos de Salud**: No compartimos datos de salud con terceros
- [ ] **Permisos**: Justificación clara de cada permiso solicitado
- [ ] **Contenido Apropiado**: Ads configurados como G-rated

### Google Play Store

- [ ] **Target SDK**: Android 13 (API 33) o superior
- [ ] **Política de Privacidad**: Link en la consola y dentro de la app
- [ ] **Declaración de Datos**: Completar cuestionario de seguridad de datos
- [ ] **Content Rating**: Clasificación IARC correcta
- [ ] **Permisos**: Declaración de todos los permisos en manifest

## Paso 7: Después de la Aprobación

### Monitoreo

1. **Crash Reports**: Configurar Sentry o similar
2. **Analytics** (opcional y privado): Considerar analytics offline
3. **Reviews**: Responder a reseñas de usuarios

### Actualizaciones

Para publicar actualizaciones:

1. Incrementar `version` y `buildNumber`/`versionCode` en `app.json`
2. Hacer build nuevo con EAS
3. Enviar a las tiendas

```bash
# iOS
eas build --platform ios --auto-submit

# Android
eas build --platform android --auto-submit
```

## Paso 8: Marketing Post-Launch

### App Store Optimization (ASO)

- Actualizar capturas basándose en feedback
- Optimizar keywords basándose en búsquedas
- Responder a todas las reseñas
- Pedir reseñas a usuarios satisfechos

### Promoción

- Redes sociales
- Blog posts sobre privacidad menstrual
- Colaboraciones con influencers de salud femenina
- Press releases destacando privacidad 100% offline

## Troubleshooting

### Build Failures

```bash
# Limpiar cache
rm -rf node_modules
npm install

# Verificar versiones
expo doctor
```

### Rechazo de App Store

Razones comunes:
- Ads demasiado intrusivos → Reducir frecuencia
- Falta política de privacidad → Añadir link
- Funcionalidad mínima → Destacar features completas

### Rechazo de Google Play

Razones comunes:
- Política de privacidad incorrecta → Actualizar
- Permisos no justificados → Explicar en descripción
- Content rating incorrecto → Re-clasificar

## Recursos Útiles

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [AdMob Policies](https://support.google.com/admob/answer/6128543)

---

¡Buena suerte con tu lanzamiento! 🚀
