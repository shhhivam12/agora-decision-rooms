import React from 'react';
import type { RoomLoaderProps } from './RoomLoader.types';
import { roomLoaderGeometry as g } from './roomLoaderGeometry';
import './RoomLoader.web.css';

/** CSS transforms keep the loop off React's render path. */
export function RoomLoader({
  size = 64,
  label = 'Loading your room',
  badge = true,
  paused = false,
}: RoomLoaderProps) {
  return (
    <svg
      role="progressbar"
      aria-label={label}
      aria-busy="true"
      width={size}
      height={size}
      viewBox={`0 0 ${g.viewBox} ${g.viewBox}`}
      className="room-loader"
      data-paused={paused}
    >
      {badge && (
        <rect width={g.viewBox} height={g.viewBox} rx="260" fill={g.ink} />
      )}
      <circle cx="512" cy="512" r={g.tableRadius} fill={g.table} />
      <g className="room-loader-people">
        <path d={g.peoplePath} fill={g.people} fillRule="evenodd" />
      </g>
    </svg>
  );
}
