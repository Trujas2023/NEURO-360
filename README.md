# Sense & Play Adventures 360

Aplicación móvil (React Native + Expo + TypeScript) dirigida a niños
neurodivergentes y a sus padres, con dos áreas principales:

- **Mi Voz** — comunicador AAC con tarjetas visuales para construir frases
  y reproducirlas por voz.
- **Juega & Regula** — seis minijuegos sensoriales de baja estimulación.

Es una app nativa/híbrida real (no una web ni una PWA), pensada desde el
inicio para publicarse en Google Play y quedar preparada arquitectónicamente
para una futura publicación en iOS. Diseño offline-first, sin publicidad,
rastreadores, ubicación, chat ni redes sociales.

El desarrollo avanza por fases; ver [`docs/ROADMAP.md`](docs/ROADMAP.md)
para el estado actual y [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) para
el detalle de la arquitectura. Las notas de cumplimiento de políticas de
Google Play para apps infantiles están en
[`docs/GOOGLE_PLAY_COMPLIANCE.md`](docs/GOOGLE_PLAY_COMPLIANCE.md).

## Requisitos

- Node.js 20+
- npm

## Puesta en marcha

```bash
npm install
npm start        # Metro / Expo dev server
npm run android  # abrir en Android (emulador o Expo Go)
npm run ios      # abrir en iOS (requiere macOS)
```

## Scripts

| Script             | Descripción                          |
| ------------------ | ------------------------------------- |
| `npm start`         | Inicia el servidor de desarrollo Expo |
| `npm run android`   | Abre la app en Android                |
| `npm run ios`       | Abre la app en iOS                    |
| `npm run web`       | Abre la app en modo web (solo dev)    |
| `npm run typecheck` | Verifica tipos con TypeScript          |
| `npm run lint`      | Ejecuta ESLint                         |
| `npm run format`    | Formatea el código con Prettier        |
