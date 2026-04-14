import { useState, useEffect, useCallback, useRef } from 'react';
import { MoodId } from '../types/mood';

export type Phase = 'landing' | 'transitioning' | 'room';

export interface MoodEngineState {
  moodId: MoodId;
  phase: Phase;
  evolutionStage: number;
  timeInMood: number;
  isUnstable: boolean;
  recentSwitches: number;
}

export interface MoodEngineActions {
  selectMood: (id: MoodId) => void;
  goHome: () => void;
}

const EVOLUTION_THRESHOLDS = [0, 30, 90, 180]; // seconds for each stage

export function useMoodEngine(): MoodEngineState & MoodEngineActions {
  const [moodId, setMoodId] = useState<MoodId>('mysterious');
  const [phase, setPhase] = useState<Phase>('landing');
  const [evolutionStage, setEvolutionStage] = useState(0);
  const [timeInMood, setTimeInMood] = useState(0);
  const [recentSwitches, setRecentSwitches] = useState(0);

  const moodStartTime = useRef(Date.now());
  const switchTimestamps = useRef<number[]>([]);
  const transitionTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Tick timer when in room
  useEffect(() => {
    if (phase !== 'room') return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - moodStartTime.current) / 1000;
      setTimeInMood(elapsed);

      // Stage 0→1 at 30s, 1→2 at 90s, 2→3 at 180s
      const stage = EVOLUTION_THRESHOLDS.filter((t) => elapsed >= t).length - 1;
      setEvolutionStage(Math.min(stage, 3));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Decay recentSwitches every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      switchTimestamps.current = switchTimestamps.current.filter(
        (t) => now - t < 10000
      );
      setRecentSwitches(switchTimestamps.current.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const selectMood = useCallback((id: MoodId) => {
    const now = Date.now();
    switchTimestamps.current = [
      ...switchTimestamps.current.filter((t) => now - t < 10000),
      now,
    ];
    setRecentSwitches(switchTimestamps.current.length);

    setMoodId(id);
    moodStartTime.current = Date.now();
    setTimeInMood(0);
    setEvolutionStage(0);

    if (phase === 'landing') {
      setPhase('transitioning');
      clearTimeout(transitionTimeout.current);
      transitionTimeout.current = setTimeout(() => setPhase('room'), 1000);
    }
  }, [phase]);

  const goHome = useCallback(() => {
    setPhase('landing');
    setEvolutionStage(0);
    setTimeInMood(0);
  }, []);

  const isUnstable = recentSwitches >= 3;

  return {
    moodId,
    phase,
    evolutionStage,
    timeInMood,
    isUnstable,
    recentSwitches,
    selectMood,
    goHome,
  };
}
