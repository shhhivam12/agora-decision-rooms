import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RoomLoader } from '../src/ui/RoomLoader.web';

function Preview() {
  const [paused, setPaused] = useState(false);
  return (
    <main>
      <header>
        <div>
          <p className="eyebrow">AGORA DECISION ROOMS</p>
          <h1>A room in motion.</h1>
        </div>
        <button
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? 'Resume animation' : 'Pause animation'}
        </button>
      </header>
      <p className="intro">
        Three people. One table. A smooth, continuous orbit.
      </p>
      <section className="preview" aria-label="Loading screen preview">
        <RoomLoader size={160} paused={paused} label="Opening your room" />
        <h2>Opening your room</h2>
        <p>Getting everyone around the table.</p>
      </section>
      <div className="sizes" aria-label="Loader sizes">
        {[24, 32, 48, 64, 96].map(size => (
          <div key={size} className="sample">
            <RoomLoader
              size={size}
              paused={paused}
              label={`Loader at ${size} pixels`}
            />
            <span>{size} px</span>
          </div>
        ))}
      </div>
      <footer>
        Stationary table · Seamless 2.4-second loop · Reduced-motion support
      </footer>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Loader preview root was not found');
createRoot(root).render(<Preview />);
