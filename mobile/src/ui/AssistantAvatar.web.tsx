import React, { memo, useEffect, useId, useRef, useState } from 'react';
import { AssistantFigure, type AssistantPose } from './AssistantFigure';
import { mouthOpening, type AssistantMode } from '../assistantActivity';
import { useLanguage } from '../i18n';
import './AssistantAvatar.web.css';

const poses: AssistantPose[] = ['welcome', 'explain', 'agree'];
export const AssistantAvatar = memo(function AssistantAvatarView({
  mode,
  level = 0,
  gestureOverride,
}: {
  mode: AssistantMode;
  level?: number;
  gestureOverride?: 0 | 1 | 2;
}) {
  const [gesture, setGesture] = useState(0);
  const sequence = useRef(0);
  const id = useId().replace(/[^a-z0-9]/gi, '');
  const { t } = useLanguage();
  useEffect(() => {
    if (mode === 'speaking') setGesture(sequence.current++ % 3);
  }, [mode]);
  const pose =
    mode === 'thinking'
      ? 'think'
      : mode === 'speaking'
      ? poses[gestureOverride ?? gesture]
      : 'listen';
  return (
    <div
      className="assistant-avatar"
      data-mode={mode}
      data-pose={pose}
      aria-label={t('Animated room assistant')}
      role="img"
    >
      <AssistantFigure
        pose={pose}
        motion={{ mouth: mouthOpening(mode, level) }}
        idPrefix={id}
      />
    </div>
  );
});
