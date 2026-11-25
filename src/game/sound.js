// Short synthesized effects; no external audio files or services are required.
let context;
export function sound(kind,enabled=true){
 if(!enabled)return;
 try{
  context ||= new (window.AudioContext||window.webkitAudioContext)();
  const oscillator=context.createOscillator(),gain=context.createGain();
  const now=context.currentTime, freq={hit:95,search:260,build:140,hurt:65}[kind]||180;
  oscillator.type=kind==='hurt'?'sawtooth':'triangle';oscillator.frequency.setValueAtTime(freq,now);oscillator.frequency.exponentialRampToValueAtTime(freq*.55,now+.12);
  gain.gain.setValueAtTime(.035,now);gain.gain.exponentialRampToValueAtTime(.001,now+.15);
  oscillator.connect(gain);gain.connect(context.destination);oscillator.start(now);oscillator.stop(now+.16);
 }catch{}
}
