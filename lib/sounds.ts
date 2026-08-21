"use client";

// ponytail: synthesized sounds via Howler. Replace with .mp3/.ogg later.

import { Howl } from "howler";

type SoundName = "pop" | "thump" | "click" | "reveal" | "connect";

const cache: Partial<Record<SoundName, Howl>> = {};

function makeBuffer(freq: number, duration: number, type: OscillatorType) {
  const sampleRate = 22050;
  const samples = Math.floor(sampleRate * duration);
  const buffer = new AudioBuffer({
    length: samples,
    sampleRate,
  });
  const data = buffer.getChannelData(0);
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    let envelope = 1 - t / duration;
    envelope = Math.max(0, envelope * envelope);
    let value = 0;
    if (type === "sine") value = Math.sin(2 * Math.PI * freq * t);
    else if (type === "square")
      value = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1;
    else if (type === "sawtooth")
      value = 2 * (t * freq - Math.floor(0.5 + t * freq));
    else if (type === "triangle")
      value = Math.abs(4 * (t * freq - Math.floor(0.5 + t * freq))) - 1;
    data[i] = value * envelope * 0.25;
  }
  return buffer;
}

function makePop() {
  const ctx = new (window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

let audioCtx: AudioContext | null = null;
let muted = false;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
  }
  return audioCtx;
}

export function setMuted(m: boolean) {
  muted = m;
}

export function isMuted() {
  return muted;
}

// ponytail: hydrate from localStorage at module load.
if (typeof window !== "undefined") {
  try {
    muted = localStorage.getItem("chaos.sound") !== "1";
  } catch {}
}

export function play(name: SoundName) {
  if (muted) return;
  try {
    if (name === "pop") {
      const ctx = getCtx();
      const buf = makeBuffer(800, 0.08, "sine");
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      src.buffer = buf;
      gain.gain.value = 0.3;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      return;
    }
    if (name === "click") {
      const ctx = getCtx();
      const buf = makeBuffer(1200, 0.03, "square");
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      src.buffer = buf;
      gain.gain.value = 0.08;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      return;
    }
    if (name === "thump") {
      const ctx = getCtx();
      const buf = makeBuffer(80, 0.25, "sine");
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      src.buffer = buf;
      gain.gain.value = 0.5;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start();
      return;
    }
    if (name === "reveal") {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(60, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
      return;
    }
    if (name === "connect") {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
      return;
    }
  } catch {
    // ponytail: sound failure is fine, swallow
  }
}
