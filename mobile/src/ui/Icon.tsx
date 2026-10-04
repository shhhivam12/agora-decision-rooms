import React from 'react';
import { Image } from 'react-native';
import home from '../../assets/icons/home.png';
import rooms from '../../assets/icons/rooms.png';
import people from '../../assets/icons/people.png';
import profile from '../../assets/icons/profile.png';
import plus from '../../assets/icons/plus.png';
import arrow from '../../assets/icons/arrow.png';
import back from '../../assets/icons/back.png';
import diagonal from '../../assets/icons/diagonal.png';
import check from '../../assets/icons/check.png';
import mic from '../../assets/icons/mic.png';
import muted from '../../assets/icons/muted.png';
import hand from '../../assets/icons/hand.png';
import captions from '../../assets/icons/captions.png';
import pause from '../../assets/icons/pause.png';
import play from '../../assets/icons/play.png';
import leave from '../../assets/icons/leave.png';
import clock from '../../assets/icons/clock.png';
import search from '../../assets/icons/search.png';
import calendar from '../../assets/icons/calendar.png';
import expand from '../../assets/icons/expand.png';
import waveform from '../../assets/icons/waveform.png';
import chevron from '../../assets/icons/chevron.png';
import coffee from '../../assets/icons/coffee.png';
import link from '../../assets/icons/link.png';
import { colors } from './theme';
const icons = {
  home,
  rooms,
  people,
  profile,
  plus,
  arrow,
  back,
  diagonal,
  check,
  mic,
  muted,
  hand,
  captions,
  pause,
  play,
  leave,
  clock,
  search,
  calendar,
  expand,
  waveform,
  chevron,
  coffee,
  link,
};
export type IconName = keyof typeof icons;
export function Icon({
  name,
  size = 22,
  color = colors.ink,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return (
    <Image
      accessible={false}
      source={icons[name]}
      style={{ width: size, height: size, tintColor: color }}
    />
  );
}
