// Profile pictures (MB-1): the 20 JudYa icons. Always read through getAvatar; never build file paths elsewhere.
import profiles from '../../../docs/design/assets/profile-icons/profiles.json';

const urls = import.meta.glob('../../../docs/design/assets/profile-icons/svg/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const urlOf = (file: string): string => Object.entries(urls).find(([k]) => k.endsWith('/' + file.split('/').pop()))?.[1] ?? '';

export type AvatarInfo = { id: string; src: string; alt: string; bg: string };
export const AVATARS: AvatarInfo[] = profiles.items.map((i) => ({ id: i.id, src: urlOf(i.svg), alt: i.alt, bg: i.background }));
export const DEFAULT_AVATAR_ID = 'profile-01';
/** Unknown or missing id → the default icon, never a broken picture. */
export const getAvatar = (id?: string | null): AvatarInfo => AVATARS.find((a) => a.id === id) ?? (AVATARS.find((a) => a.id === DEFAULT_AVATAR_ID) as AvatarInfo);
