
export class MusicBox {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private noteIndex: number = 0;
  private timerID: number | null = null;
  private tempo: number = 100; // BPM

  // Silent Night Melody
  // Format: [Frequency (Hz), Duration (beats)]
  // 0 frequency denotes a rest
  private melody: number[][] = [
    // Sleep in heavenly peace... (Starting from the recognizable G A G E part)
    [392.00, 1.5], [440.00, 0.5], [392.00, 1.0], [329.63, 3.0], // G A G E
    [392.00, 1.5], [440.00, 0.5], [392.00, 1.0], [329.63, 3.0], // G A G E
    [587.33, 2.0], [587.33, 1.0], [493.88, 3.0], // D5 D5 B
    [523.25, 2.0], [523.25, 1.0], [392.00, 3.0], // C5 C5 G
    [440.00, 2.0], [440.00, 1.0], [523.25, 1.5], [493.88, 0.5], [440.00, 1.0], // A A C B A
    [392.00, 1.5], [440.00, 0.5], [392.00, 1.0], [329.63, 3.0], // G A G E
    [587.33, 2.0], [587.33, 1.0], [659.25, 1.5], [587.33, 0.5], [523.25, 1.0], // D5 D5 E5 D5 C5
    [523.25, 3.0], [659.25, 3.0], // C5 E5
    [523.25, 1.5], [392.00, 0.5], [329.63, 1.0], [392.00, 3.0], // C G E G (Ending loop)
    [0, 2.0] // Rest before loop
  ];

  constructor() {
    this.scheduler = this.scheduler.bind(this);
  }

  private init() {
    if (!this.ctx) {
      // Initialize AudioContext on first user interaction
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    // Always attempt to resume if suspended (needed for Safari/Chrome autoplay policies)
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private playNote(freq: number, duration: number, time: number) {
    if (!this.ctx) return;

    // Create Oscillator (The "Tine")
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Use Sine wave for pure bell-like tone
    osc.type = 'sine'; 
    osc.frequency.value = freq;

    // Envelope for Music Box (Pluck + Decay)
    const attackTime = 0.02;
    const decayTime = duration * 1.5;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.25, time + attackTime); // Volume
    gain.gain.exponentialRampToValueAtTime(0.001, time + decayTime);

    // Optional: Add a second harmonic for richness
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2; // Octave up
    gain2.gain.setValueAtTime(0, time);
    gain2.gain.linearRampToValueAtTime(0.05, time + attackTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, time + decayTime * 0.8);

    // Connections
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);

    // Start/Stop
    osc.start(time);
    osc.stop(time + decayTime);
    osc2.start(time);
    osc2.stop(time + decayTime);
  }

  /**
   * Sound Effect: Low "Thud" for Assembly
   */
  public playThud() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const duration = 0.8;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Deep sine/triangle drop
    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.3);

    // Percussive envelope
    gain.gain.setValueAtTime(1.5, t); // Louder start
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    // Lowpass filter to muffle the triangle wave slightly
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + duration);
  }

  /**
   * Sound Effect: Airy "Swoosh" for Disassembly
   */
  public playSwoosh() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const duration = 1.2;

    // Create White Noise Buffer
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.5;

    // Filter Sweep: Low to High to simulate "opening up" or movement
    filter.frequency.setValueAtTime(100, t);
    filter.frequency.exponentialRampToValueAtTime(1500, t + duration * 0.8);
    filter.frequency.exponentialRampToValueAtTime(400, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + duration * 0.2); // Fade in
    gain.gain.linearRampToValueAtTime(0, t + duration); // Fade out

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  private scheduler() {
    if (!this.ctx || !this.isPlaying) return;

    // Lookahead: Schedule notes for the next 0.1s
    const lookahead = 0.1;
    const secondsPerBeat = 60.0 / this.tempo;

    while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
      const note = this.melody[this.noteIndex];
      const freq = note[0];
      const beats = note[1];

      if (freq > 0) {
        this.playNote(freq, beats * secondsPerBeat, this.nextNoteTime);
      }

      this.nextNoteTime += beats * secondsPerBeat;
      
      // Loop
      this.noteIndex++;
      if (this.noteIndex >= this.melody.length) {
        this.noteIndex = 0;
      }
    }

    this.timerID = window.setTimeout(this.scheduler, 25);
  }

  public play() {
    this.init();
    if (!this.ctx) return;

    if (!this.isPlaying) {
      this.isPlaying = true;
      this.nextNoteTime = this.ctx.currentTime + 0.1;
      this.noteIndex = 0;
      this.scheduler();
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerID) {
      clearTimeout(this.timerID);
      this.timerID = null;
    }
  }
}
