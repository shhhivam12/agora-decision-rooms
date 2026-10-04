import type { ImageSourcePropType } from 'react-native';
import priyaAvatar from '../../assets/characters/priya-avatar.webp';
import priyaBust from '../../assets/characters/priya-bust.webp';
import ayaanAvatar from '../../assets/characters/ayaan-avatar.webp';
import ayaanBust from '../../assets/characters/ayaan-bust.webp';
import mayaAvatar from '../../assets/characters/maya-avatar.webp';
import mayaBust from '../../assets/characters/maya-bust.webp';
import kabirAvatar from '../../assets/characters/kabir-avatar.webp';
import kabirBust from '../../assets/characters/kabir-bust.webp';
import hostAvatar from '../../assets/characters/host-avatar.webp';
import hostBust from '../../assets/characters/host-bust.webp';
import discussion from '../../assets/characters/discussion.webp';
import compare from '../../assets/characters/compare.webp';
import agreed from '../../assets/characters/agreed.webp';
export const characterPortraits: Record<string, ImageSourcePropType> = {
  you: hostAvatar,
  host: hostAvatar,
  priya: priyaAvatar,
  ayaan: ayaanAvatar,
  maya: mayaAvatar,
  kabir: kabirAvatar,
};
export const characterBusts: Record<string, ImageSourcePropType> = {
  you: hostBust,
  host: hostBust,
  priya: priyaBust,
  ayaan: ayaanBust,
  maya: mayaBust,
  kabir: kabirBust,
};
export const storyScenes = { discussion, compare, agreed };
