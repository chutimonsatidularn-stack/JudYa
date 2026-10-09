import type { BannerState } from '../domain/selectors';

const files = import.meta.glob('../../../assets/banner/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const url = (name: string) => Object.entries(files).find(([k]) => k.endsWith(`judya-banner-${name}.svg`))?.[1] ?? '';

// the picture, the alt text and the one line of text for each state (UI-10); text is code, never part of the picture
const BANNERS: Record<BannerState, { alt: string; text: string }> = {
  normal: { alt: 'ผู้หญิงโบกมือทักทาย', text: 'วันนี้ยังไม่มีเรื่องเร่งด่วน' },
  reminder: { alt: 'ปฏิทินและขวดยาเตือนให้จัดการยา', text: 'มีเรื่องที่ควรดูวันนี้' },
  family: { alt: 'ครอบครัวกับกล่องยา', text: 'ดูแลสมาชิกในบ้านให้ครบ' },
};
export function HomeBanner({ state }: { state: BannerState }) {
  const b = BANNERS[state] ?? BANNERS.normal; // unknown state → normal
  return (
    <div className="hello">
      <div className="tx"><b>สวัสดีค่ะ</b><span>{b.text}</span></div>
      <div className="pic"><img src={url(BANNERS[state] ? state : 'normal')} alt={b.alt} loading={state === 'normal' ? 'eager' : 'lazy'} /></div>
    </div>
  );
}
