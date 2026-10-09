// Building blocks from docs/design-system.md, built once and reused (C-4). Class names match the approved prototype CSS.
import { useId, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { Icon } from './Icon';
import { getAvatar } from './avatars';

const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

/* ---- buttons ---- */
export function Button({ variant = 'p', icon, className, children, ...rest }: { variant?: 'p' | 's' | 'd'; icon?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={cx('btn', variant, className)} {...rest}>{icon && <Icon name={icon} size={22} />}{children}</button>;
}
export function Pill({ icon, children, ...rest }: { icon?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className="pill" {...rest}>{icon && <Icon name={icon} size={20} />}{children}</button>;
}

/* ---- cards, chips, notes ---- */
export const Card = ({ children, className }: { children: ReactNode; className?: string }) => <div className={cx('card', className)}>{children}</div>;
export function TapCard({ icon, title, text, onClick, tone }: { icon?: string; title: ReactNode; text?: ReactNode; onClick?: () => void; tone?: 'buy' | 'today' }) {
  return (
    <button type="button" className="card tap" onClick={onClick}>
      {icon && <span className={cx('disc', tone)}><Icon name={icon} size={22} /></span>}
      <span className="grow"><b>{title}</b>{text && <><br /><span className="mut sm">{text}</span></>}</span>
      <Icon name="chev" size={20} />
    </button>
  );
}
export type ChipTone = 'low' | 'ok' | 'rest' | 'info';
export const Chip = ({ tone, icon, children }: { tone: ChipTone; icon?: string; children: ReactNode }) => <span className={cx('chip', tone)}>{icon && <Icon name={icon} size={14} />}{children}</span>;
/** Status chips never rely on colour alone: icon + word (design-system principle). */
export const StockChip = ({ days, lowDays }: { days: number | null; lowDays: number }) =>
  days == null ? <Chip tone="rest" icon="info">ยังไม่ทราบ</Chip> : days <= lowDays ? <Chip tone="low" icon="alert">ใกล้หมด</Chip> : <Chip tone="ok" icon="check">พอใช้</Chip>;

export const Note = ({ tone = 'info', icon = 'info', children }: { tone?: 'info' | 'caution' | 'danger'; icon?: string; children: ReactNode }) => (
  <div className={cx('note', tone === 'caution' && 'cr')} style={tone === 'danger' ? { background: 'var(--dngbg)' } : undefined} role={tone === 'danger' ? 'alert' : undefined}>
    <Icon name={icon} size={20} /><span>{children}</span>
  </div>
);
export const Banner = ({ icon = 'alert', title, text, onClick }: { icon?: string; title: ReactNode; text?: ReactNode; onClick?: () => void }) => (
  <button type="button" className="banner" onClick={onClick}>
    <span className="d"><Icon name={icon} size={24} /></span>
    <span className="grow"><b>{title}</b>{text && <span className="sm">{text}</span>}</span>
    <Icon name="chev" size={20} />
  </button>
);
export const SummaryCard = ({ label, children }: { label: ReactNode; children: ReactNode }) => <div className="sum"><small>{label}</small><b>{children}</b></div>;

/* ---- form pieces ---- */
export function Field({ label, hint, error, children }: { label: ReactNode; hint?: ReactNode; error?: ReactNode; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div className="fld">
      <label htmlFor={id}><span>{label}</span></label>
      {children(id)}
      {error ? <span className="hx" style={{ color: 'var(--dngink)' }} role="alert">{error}</span> : hint ? <span className="hx">{hint}</span> : null}
    </div>
  );
}
export const TextInput = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input className="in1" {...p} />;
export const DateInput = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input className="in1" type="date" {...p} />;
export function Select({ id, value, onChange, options, label }: { id?: string; value: string; onChange: (v: string) => void; options: (string | { group: string; items: string[] })[]; label?: string }) {
  return (
    <div className="inp">
      <span className="selw full">
        <select id={id} aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <optgroup key={o.group} label={o.group}>{o.items.map((i) => <option key={i} value={i}>{i}</option>)}</optgroup>)}
        </select>
        <Icon name="caret" size={20} />
      </span>
    </div>
  );
}
export function NumberInput({ id, value, onChange, unit, min = 0, max = 9999, step = 0.25, label }: { id?: string; value: string; onChange: (v: string) => void; unit?: ReactNode; min?: number; max?: number; step?: number; label?: string }) {
  return (
    <div className="inp">
      <input id={id} aria-label={label} className="bare" inputMode="decimal" type="number" min={min} max={max} step={step} value={value} onChange={(e) => onChange(e.target.value)} />
      {unit && <span className="unit">{unit}</span>}
    </div>
  );
}
export function Stepper({ value, onMinus, onPlus, label, minusDisabled, plusDisabled }: { value: ReactNode; onMinus: () => void; onPlus: () => void; label: string; minusDisabled?: boolean; plusDisabled?: boolean }) {
  return (
    <div className="step big" role="group" aria-label={label}>
      <button type="button" aria-label={`ลด ${label}`} onClick={onMinus} disabled={minusDisabled}><Icon name="minus" size={22} /></button>
      <output aria-live="polite">{value}</output>
      <button type="button" aria-label={`เพิ่ม ${label}`} onClick={onPlus} disabled={plusDisabled}><Icon name="plus" size={22} /></button>
    </div>
  );
}
/** Single or multi choice chips; the chosen chip shows a check (not colour alone). */
export function ChipGroup<T extends string>({ options, value, onChange, label, multiple }: { options: readonly T[]; value: T | T[] | ''; onChange: (v: T) => void; label: string; multiple?: boolean }) {
  const on = (o: T) => (multiple ? (value as T[]).includes(o) : value === o);
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => <button key={o} type="button" className={cx('sch', on(o) && 'on')} aria-pressed={on(o)} onClick={() => onChange(o)}>{on(o) && <Icon name="check" size={16} />}{o}</button>)}
    </div>
  );
}
export function Switch({ checked, onChange, title, text }: { checked: boolean; onChange: (v: boolean) => void; title: ReactNode; text?: ReactNode }) {
  return (
    <button type="button" className="li" style={{ width: '100%' }} role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
      <span className="grow"><b>{title}</b>{text && <><br /><span className="mut cap">{text}</span></>}</span>
      <span className={cx('tg', checked && 'on')} />
    </button>
  );
}
export const ProgressBar = ({ percent, low }: { percent: number; low?: boolean }) => (
  <span className={cx('bar', low && 'low')} style={{ display: 'block' }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.max(0, Math.min(100, percent)))}><i style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} /></span>
);

/* ---- avatar (JudYa 20 icons) ---- */
export function Avatar({ avatarId, size = 'md' }: { avatarId?: string | null; size?: 'md' | 'lg' | 'xl' }) {
  const a = getAvatar(avatarId);
  return <img className={cx('av', size !== 'md' && size)} src={a.src} alt={a.alt} style={{ background: a.bg }} />;
}

/* ---- overlays ---- */
export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  if (!open) return null;
  return (
    <>
      <div className="dim" onClick={onClose} aria-hidden="true" />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label}><div className="grab" />{children}</div>
    </>
  );
}
export const Toast = ({ message }: { message: string }) => (message ? <div className="toast" role="status">{message}</div> : null);

/* ---- timeline (history) ---- */
export type TimelineItem = { id: string; title: ReactNode; text?: ReactNode; stop?: boolean };
export const Timeline = ({ items }: { items: TimelineItem[] }) => <div className="tl">{items.map((i) => <div key={i.id} className={cx('tli', i.stop && 'stop')}><i /><b>{i.title}</b>{i.text && <div className="sm">{i.text}</div>}</div>)}</div>;

/* ---- allergy block: red warning in the member's profile (AL-2) ---- */
export function AllergyBlock({ items, onEdit, onDelete }: { items: { id: string; drug: string; symptoms: string[]; note?: string; recordedOn: string }[]; onEdit?: (id: string) => void; onDelete?: (id: string) => void }) {
  if (!items.length) return null;
  return (
    <div className="card" style={{ border: '2px solid var(--dng)', background: 'var(--dngbg)' }} role="alert">
      <b style={{ color: 'var(--dngink)', fontSize: 18, display: 'flex', gap: 8, alignItems: 'center' }}><Icon name="alert" size={22} />แพ้ยา {items.length} รายการ</b>
      {items.map((a, i) => (
        <div key={a.id} style={{ marginTop: 12, paddingTop: 12, borderTop: i ? '1px solid var(--dngborder)' : undefined }}>
          <b>{a.drug}</b><br /><span className="sm">อาการ: {a.symptoms.join(', ')}{a.note ? ` · ${a.note}` : ''}</span><br /><span className="mut sm">บันทึกเมื่อ {a.recordedOn}</span>
          {(onEdit || onDelete) && <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {onEdit && <Button variant="s" style={{ flex: 1, height: 44, fontSize: 16 }} onClick={() => onEdit(a.id)} icon="edit">แก้ไข</Button>}
            {onDelete && <Button variant="d" style={{ flex: 1, height: 44, fontSize: 16 }} onClick={() => onDelete(a.id)}>ลบ</Button>}
          </div>}
        </div>
      ))}
    </div>
  );
}
