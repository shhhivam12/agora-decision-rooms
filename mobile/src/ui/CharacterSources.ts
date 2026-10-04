import type { ImageSourcePropType } from 'react-native';
import priyaAvatar from '../../assets/characters/priya-avatar.png';
import priyaBust from '../../assets/characters/priya-bust.png';
import ayaanAvatar from '../../assets/characters/ayaan-avatar.png';
import ayaanBust from '../../assets/characters/ayaan-bust.png';
import mayaAvatar from '../../assets/characters/maya-avatar.png';
import mayaBust from '../../assets/characters/maya-bust.png';
import kabirAvatar from '../../assets/characters/kabir-avatar.png';
import kabirBust from '../../assets/characters/kabir-bust.png';
import hostAvatar from '../../assets/characters/host-avatar.png';
import hostBust from '../../assets/characters/host-bust.png';
import discussion from '../../assets/characters/discussion.png';
import compare from '../../assets/characters/compare.png';
import agreed from '../../assets/characters/agreed.png';
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
