/**
 * Signal discret quand le rapport est prêt (Web Audio — pas de fichier).
 * Le contexte doit être « déverrouillé » dans la même interaction utilisateur que le lancement d’audit,
 * puis la lecture peut avoir lieu après l’appel réseau.
 */

function getAudioContextClass(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ||
    null
  );
}

/** À appeler de façon synchrone au clic (ex. début de runScan), avant tout await. */
export function primeAuditSoundContext(existing: AudioContext | null): AudioContext | null {
  try {
    const AC = getAudioContextClass();
    if (!AC) return existing;
    const ctx = existing ?? new AC();
    void ctx.resume();
    return ctx;
  } catch {
    return existing;
  }
}

export function playAuditReadyChime(ctx: AudioContext | null): void {
  if (!ctx) return;

  const run = () => {
    try {
      const now = ctx.currentTime;
      const beep = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.055, start + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.04);
      };
      beep(523.25, now, 0.11);
      beep(659.25, now + 0.09, 0.14);
      beep(783.99, now + 0.2, 0.16);
    } catch {
      /* navigateur ou politique audio */
    }
  };

  if (ctx.state === "suspended") {
    void ctx.resume().then(run);
  } else {
    run();
  }
}
