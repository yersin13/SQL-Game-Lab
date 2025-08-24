export function useBeep() {
  let ctx: AudioContext | null = null;
  const ensure = () => (ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)());
  return (freq = 740, ms = 80) => {
    try {
      const ac = ensure();
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "square";
      o.frequency.value = freq;
      g.gain.value = 0.02;
      o.connect(g); g.connect(ac.destination);
      o.start();
      setTimeout(() => { o.stop(); o.disconnect(); g.disconnect(); }, ms);
    } catch { /* noop */ }
  };
}
