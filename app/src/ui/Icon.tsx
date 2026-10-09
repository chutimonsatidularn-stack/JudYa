import { ICONS } from './icons';

export function Icon({ name, size = 24 }: { name: string; size?: number }) {
  const body = ICONS[name] ?? '';
  // constant path data from icons.ts (never user input), so this is safe (SEC-1)
  return <svg className="ic" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: body }} />;
}
