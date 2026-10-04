import React, { memo } from 'react';
import type { VoiceRoom } from '../VoiceRoomApi';
import type { VideoFeed } from '../agora/WebVoiceSession';
import { assistantActivity } from '../assistantActivity';
import { AssistantAvatar } from './AssistantAvatar.web';
import { VideoTile } from './VideoTile.web';
import { Avatar } from './Portrait';
import { useLanguage } from '../i18n';

export const RoomParticipants = memo(function RoomParticipantsView({
  room,
  ownUid,
  feeds,
  peers,
  stageOnly,
  state,
  level,
  audioBlocked,
  joined,
}: {
  room: VoiceRoom;
  ownUid: string;
  feeds: VideoFeed[];
  peers: string[];
  stageOnly: boolean;
  state: string;
  level: number;
  audioBlocked: boolean;
  joined: boolean;
}) {
  const { t } = useLanguage();
  const checking = Object.values(room.stage?.checks || {}).some(
    check => check?.status === 'checking',
  );
  const activity = assistantActivity({
    stageOnly,
    joined,
    state,
    level,
    checking,
    audioBlocked,
  });
  return (
    <aside
      className="room-call-panel"
      aria-label={t('Participants and room assistant')}
    >
      <div className="room-panel-heading">
        <span>{t('Your people')}</span>
        <span>
          {room.members.length} + {t('AI assistant')}
        </span>
      </div>
      <div
        className="room-people-grid"
        style={
          { '--tile-count': room.members.length + 1 } as React.CSSProperties
        }
      >
        {room.members.map((member, i) => {
          const feed = feeds.find(item => item.uid === member.uid);
          const connected =
            stageOnly || member.uid === ownUid || peers.includes(member.uid);
          return (
            <div
              className="room-person-tile"
              key={member.uid}
              aria-label={member.name}
            >
              {feed ? (
                <VideoTile feed={feed} name={member.name} />
              ) : (
                <div className="room-camera-off">
                  <Avatar
                    id={
                      member.uid === ownUid
                        ? 'you'
                        : ['priya', 'ayaan', 'maya', 'kabir'][i % 4]
                    }
                    size={54}
                  />
                  <span className="room-person-name">
                    {member.name}
                    {member.uid === ownUid ? ` · ${t('You')}` : ''}
                  </span>
                  <span className="room-person-meta">
                    {t(
                      !connected
                        ? 'Joining'
                        : stageOnly
                        ? 'Voice off'
                        : 'Camera off',
                    )}
                  </span>
                </div>
              )}
            </div>
          );
        })}
        <div
          className="room-person-tile room-assistant-tile"
          data-mode={activity.mode}
        >
          <div className="room-assistant-art">
            <AssistantAvatar mode={activity.mode} level={level} />
          </div>
          <span className="room-person-name">{t('Room assistant')}</span>
          <span className="room-person-meta" role="status">
            {t(activity.label)}
          </span>
        </div>
      </div>
    </aside>
  );
});
