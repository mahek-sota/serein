export type MoodId =
  | 'anxious'
  | 'content'
  | 'happy'
  | 'angry'
  | 'sad'
  | 'hopeful'
  | 'mysterious';

export interface MoodColors {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
  muted: string;
  glow: string;
  cardBg: string;
  cardBorder: string;
  dropdownBg: string;
}

export interface MoodTypography {
  fontFamily: string;
  weight: number;
  letterSpacing: string;
  lineHeight: string;
  style: 'normal' | 'italic';
}

export type CursorStyle = 'jitter' | 'soft' | 'sharp' | 'blur' | 'sparkle' | 'ember' | 'reveal';
export type TextAnimation = 'fragment' | 'fade' | 'snap' | 'drift' | 'bounce' | 'rise' | 'breathe';
export type SpacingDensity = 'tight' | 'normal' | 'loose';

export interface MoodInteraction {
  transitionDuration: number;
  borderRadius: string;
  spacing: SpacingDensity;
  cursorStyle: CursorStyle;
  textAnimation: TextAnimation;
  soundHook: string;
}

export interface EvolutionStage {
  duration: number;
  atmosphericLabel: string;
  intensity: number;
}

export interface PlaylistItem {
  title: string;
  artist: string;
  url: string;
}

export interface LandingCardMeta {
  description: string;
  floatDelay: number;
  floatDuration: number;
  floatDistance: number;
}

export interface MoodConfig {
  id: MoodId;
  poeticName: string;
  symbol: string;
  tagline: string;
  lines: string[];
  emotionalMetric: {
    label: string;
    stages: string[];
  };
  colors: MoodColors;
  typography: MoodTypography;
  interaction: MoodInteraction;
  evolution: EvolutionStage[];
  playlist: PlaylistItem[];
  landingCard: LandingCardMeta;
}

export type MoodMap = Record<MoodId, MoodConfig>;
