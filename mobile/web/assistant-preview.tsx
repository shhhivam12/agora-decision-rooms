import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AssistantAvatar } from '../src/ui/AssistantAvatar.web';
import type { AssistantMode } from '../src/assistantActivity';

const samples = [
  {
    label: 'Speaking · welcome',
    mode: 'speaking',
    gesture: 0,
    file: 'speaking-welcome',
  },
  {
    label: 'Speaking · explain',
    mode: 'speaking',
    gesture: 1,
    file: 'speaking-explain',
  },
  {
    label: 'Speaking · agree',
    mode: 'speaking',
    gesture: 2,
    file: 'speaking-agree',
  },
  { label: 'Thinking', mode: 'thinking', file: 'thinking' },
  { label: 'Listening', mode: 'listening', file: 'listening' },
] as const;
// Vite bundles the exports only for this preview page; live calls use the SVG rig.
const webm = import.meta.glob('../assets/assistant-motion/*.webm', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const mp4 = import.meta.glob('../assets/assistant-motion/*.mp4', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function Preview() {
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const [level, setLevel] = useState(0);
  const sample = samples[selected];
  useEffect(() => {
    if (sample.mode !== 'speaking' || paused) {
      setLevel(0);
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      const t = (Date.now() - start) / 1000;
      setLevel(
        Math.sin(t * 4) < -0.6 ? 0 : 0.05 + 0.14 * Math.abs(Math.sin(t * 12)),
      );
    }, 120);
    return () => clearInterval(timer);
  }, [sample, paused]);
  const base = '../assets/assistant-motion/' + sample.file;
  return (
    <main>
      <header>
        <div>
          <p className="eyebrow">AGORA DECISION ROOMS</p>
          <h1>Kabir, in the conversation.</h1>
        </div>
        <a href="/">Open app</a>
      </header>
      <p>Animation preview · sample speech motion, not a live call.</p>
      <nav className="controls" aria-label="Animation states">
        {samples.map((item, index) => (
          <button
            type="button"
            key={item.file}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? 'Resume SVG motion' : 'Pause SVG motion'}
        </button>
      </nav>
      <div className="samples">
        <section
          className={'sample' + (paused ? ' motion-paused' : '')}
          aria-label="Live SVG animation preview"
        >
          <h2>In the room</h2>
          <div className="art">
            <AssistantAvatar
              mode={sample.mode as AssistantMode}
              level={level}
              gestureOverride={'gesture' in sample ? sample.gesture : undefined}
            />
          </div>
          <p>{sample.label} · live SVG</p>
          <p>
            In calls, the mouth follows the incoming assistant audio. This
            preview uses a sample volume signal.
          </p>
        </section>
        <section className="sample" aria-label="Exported video preview">
          <h2>For your demo video</h2>
          <video
            key={sample.file}
            aria-label={sample.label + ' video loop'}
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
          >
            <source src={webm[base + '.webm']} type="video/webm" />
            <source src={mp4[base + '.mp4']} type="video/mp4" />
          </video>
          <p>4-second loop · 20 fps · transparent WebM</p>
          <div className="caption">
            <a href={webm[base + '.webm']} download>
              Download WebM
            </a>
            <a href={mp4[base + '.mp4']} download>
              Download MP4
            </a>
          </div>
        </section>
      </div>
      <footer>
        Three speaking gestures · thinking dots · attentive listening ·
        reduced-motion support in the app.
      </footer>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Assistant preview root was not found');
createRoot(root).render(<Preview />);
