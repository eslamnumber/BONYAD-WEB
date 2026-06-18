/**
 * Settings-detail chrome (back link + ambient glow) now lives in the shared layout
 * layer so every settings sub-screen — profile, portfolio, cards — matches. Re-exported
 * here under the original names so the profile screens keep importing from one place.
 */
export {
  SettingsAmbientGlow as ProfileAmbientGlow,
  SettingsBackLink as ProfileBackLink,
} from '@/components/layout/settings-detail-chrome';
