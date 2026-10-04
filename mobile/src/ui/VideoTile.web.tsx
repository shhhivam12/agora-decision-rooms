import React, { useEffect, useRef, useState } from 'react';
import type { VideoFeed } from '../agora/WebVoiceSession';
import { colors } from './theme';
import { useLanguage } from '../i18n';

export function VideoTile({ feed, name }: { feed: VideoFeed; name: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const { t } = useLanguage();
  useEffect(() => {
    setFailed(false);
    try {
      if (container.current)
        feed.track.play(container.current, {
          fit: 'cover',
          mirror: feed.local,
        });
    } catch {
      setFailed(true);
    }
    return () => {
      try {
        feed.track.stop();
      } catch {
        /* Track may already be closed by Leave. */
      }
    };
  }, [feed.track, feed.local]);
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: colors.ink,
        borderRadius: 22,
        overflow: 'hidden',
      }}
    >
      <div
        ref={container}
        aria-label={`${name} ${t('video')}`}
        style={{ position: 'absolute', inset: 0 }}
      />
      {failed && (
        <span
          style={{
            position: 'absolute',
            top: 16,
            left: 12,
            color: colors.inverse,
            fontSize: 11,
          }}
        >
          {t('Video could not play. Try turning the camera off and on.')}
        </span>
      )}
      <span
        style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          right: 10,
          color: colors.inverse,
          fontSize: 11,
          padding: '5px 9px',
          borderRadius: 12,
          background: 'rgba(0,0,0,.55)',
        }}
      >
        {name}
        {feed.local ? ` · ${t('You')}` : ''}
      </span>
    </div>
  );
}
