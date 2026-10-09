import { useState } from 'react';
import { Header, Body, Footer, Screen } from '../ui/Shell';
import { Button, DateInput, Field, Sheet } from '../ui/components';
import { Icon } from '../ui/Icon';
import { useRouter } from '../router';
import { useStore } from '../store';
import { useDraft } from '../draft';
import { useMedDraft } from './medicine-shared';
import { applyDoseChange, doseChanged, isNewDraft, MODES, modeOf, preview7, REASONS, toggleIn, withMode, type MedDraft } from '../domain/medicine';
import { addDays, dow, parseDate } from '../domain/calc';
import { DAY_NAMES, DAY_SHORT, fr, PERIODS, scheduleDoseText, scheduleSummary, type PeriodKey } from '../domain/format';
import { newId } from '../domain/actions';
import { todayBangkok } from '../domain/dates';

export const STEPS = [1, 0.5, 0.25] as const;

/** the reason + detail box shared by 08c and 09 (DA-3) */
export function ReasonBox({ reason, note, onReason, onNote, required }: { reason: string; note: string; onReason: (v: string) => void; onNote: (v: string) => void; required: boolean }) {
  return (
    <>
      <Field label={`เหตุผล / แหล่งข้อมูล${required ? '' : ' (ไม่บังคับ)'}`}>{(id) => (
        <div className="inp"><span className="selw full"><select id={id} value={reason} onChange={(e) => onReason(e.target.value)}><option value="">เลือกแหล่งที่มา…</option>{REASONS.map((r) => <option key={r}>{r}</option>)}</select><Icon name="caret" size={18} /></span></div>)}</Field>
      <Field label="รายละเอียดเพิ่มเติม (ไม่บังคับ)">{(id) => <textarea id={id} className="ta rbx" maxLength={200} value={note} onChange={(e) => onNote(e.target.value)} placeholder="เช่น หมอปรับหลังตรวจเลือด" />}</Field>
    </>
  );
}
/** old → new card pair used by the confirm sheet (DA-4) */
export const OldNew = ({ before, after, reason }: { before: string; after: string; reason: string }) => (
  <>
    <div className="old"><small>เดิม</small>{before}</div>
    <div style={{ textAlign: 'center', color: 'var(--mut)', height: 20, margin: '-4px 0' }}><Icon name="arrdown" size={20} /></div>
    <div className="new"><small>ใหม่</small><b>{after}</b></div>
    <div className="old" style={{ marginTop: 2 }}><small>เหตุผล</small>{reason || <span style={{ color: 'var(--dngink)' }}>ยังไม่ได้เลือกเหตุผล</span>}</div>
  </>
);

/** 08c Schedule: five modes, Thai summary, doses per time of day; an existing medicine needs a reason and a confirmation (DS-10, SF-4) */
export function SchedulePage({ k }: { k: string }) {
  const { go } = useRouter();
  const { data: d, update, say } = useStore();
  const { setMed } = useDraft();
  const { x, set } = useMedDraft(k);
  const [sheet, setSheet] = useState(false), [ack, setAck] = useState(false);
  const today = todayBangkok();
  if (!x) return <Screen><Header title="ตารางทานยา" back={`/medicine/${k}`} /><Body><p className="mut">กำลังเปิด…</p></Body></Screen>;
  const isNew = isNewDraft(x), changed = doseChanged(x), reasonOk = isNew || !!x.reason, s = x.schedule, mode = modeOf(s);
  const unit = x.baseUnit, step = x.doseStep;
  const setDose = (kk: PeriodKey, dir: 1 | -1) => set({ doses: { ...x.doses, [kk]: Math.min(9, Math.max(0, +(x.doses[kk] + dir * step).toFixed(2))) } });
  const Strip = () => (
    <div className="strip">{preview7(s, today, addDays).map(({ date, take }) => <div key={date} className={`cell ${take ? 't' : 'r'}`}><span>{DAY_SHORT[dow(date)]}</span><b>{parseDate(date).d}</b><Icon name={take ? 'check' : 'moon'} size={16} /></div>)}</div>
  );
  const confirm = () => {
    if (!ack || !changed || !x.reason || !x.base) return;
    const ok = update((cur) => applyDoseChange(cur, x.key, { doses: x.doses, schedule: x.schedule, doseStep: x.doseStep }, x.reason, x.reasonNote, today, newId('dc'), new Date().toISOString()));
    if (ok) { setMed({ ...x, base: { schedule: x.schedule, doses: { ...x.doses } }, reason: '', reasonNote: '' }); setSheet(false); setAck(false); say('บันทึกตารางใหม่แล้ว'); go(`/medicine/${k}`); }
  };
  const sub = `${x.generic} ${x.strength}`.trim();
  const stepSel = (
    <div className="fld"><span>กดแต่ละครั้งเปลี่ยนทีละ</span>
      <div className="chips" role="group" aria-label="กดแต่ละครั้งเปลี่ยนทีละ">{STEPS.map((v) => <button key={v} type="button" className={`sch${step === v ? ' on' : ''}`} aria-pressed={step === v} onClick={() => set({ doseStep: v })}>{step === v && <Icon name="check" size={16} />}{fr(v)} {unit}</button>)}</div></div>
  );
  return (
    <Screen>
      <Header title="ตารางทานยา" sub={sub} back={`/medicine/${k}`} />
      <Body gap={14}>
        <div className="chips" role="group" aria-label="โหมดตาราง">{MODES.map(([m, t]) => <button key={m} type="button" className={`sch${mode === m ? ' on' : ''}`} aria-pressed={mode === m} onClick={() => set({ schedule: withMode(s, m, today) })}>{mode === m && <Icon name="check" size={16} />}{t}</button>)}</div>
        <div>
          {s.kind === 'daily' && <p className="mut sm">ทานทุกวัน ไม่ต้องเลือกวัน</p>}
          {s.kind === 'weekdays' && <div className="days">{DAY_SHORT.map((t, i) => { const on = s.days.includes(i); return <button key={i} type="button" className={`dc${on ? ' on' : ''}`} aria-pressed={on} aria-label={`วัน${DAY_NAMES[i]}`} onClick={() => set({ schedule: { kind: 'weekdays', days: toggleIn(s.days, i) } })}>{t}</button>; })}</div>}
          {s.kind === 'interval' && <>
            {mode === 'alternate' ? <p className="mut sm" style={{ marginBottom: 8 }}>ทานวันนี้ แล้วพักวันถัดไป สลับกันไป</p>
              : <div className="dr" style={{ padding: '0 0 10px' }}><b>ทานทุก</b><div className="step big"><button type="button" aria-label="ลดจำนวนวัน" disabled={s.everyNDays <= 3} onClick={() => set({ schedule: { ...s, everyNDays: s.everyNDays - 1 } })}><Icon name="minus" /></button><output>{s.everyNDays}</output><button type="button" aria-label="เพิ่มจำนวนวัน" disabled={s.everyNDays >= 30} onClick={() => set({ schedule: { ...s, everyNDays: s.everyNDays + 1 } })}><Icon name="plus" /></button></div><b>วัน</b></div>}
            <Field label="เริ่มนับวันที่">{(id) => <DateInput id={id} value={s.anchorDate} onChange={(e) => e.target.value && set({ schedule: { ...s, anchorDate: e.target.value } })} />}</Field>
            <div style={{ height: 8 }} /><Strip /></>}
          {s.kind === 'monthDays' && <><div className="grid31">{Array.from({ length: 31 }, (_, i) => { const on = s.days.includes(i + 1); return <button key={i} type="button" className={`g${on ? ' on' : ''}`} aria-pressed={on} onClick={() => set({ schedule: { kind: 'monthDays', days: toggleIn(s.days, i + 1) } })}>{i + 1}</button>; })}</div><p className="mut cap" style={{ marginTop: 8 }}>เดือนที่ไม่มีวันนั้นจะข้าม (เช่น วันที่ 31 ในเดือนที่มี 30 วัน)</p></>}
        </div>
        <div className="sum"><small>สรุป</small><b>{scheduleSummary(s, today)}</b></div>
        {stepSel}
        <div><b style={{ fontSize: 17 }}>ขนาดยาแต่ละช่วงเวลา ({unit})</b>
          <div className="dgrid" style={{ marginTop: 8 }}>{PERIODS.map(([kk, label]) => <div key={kk} className="dose"><small>{label}</small><div className="step"><button type="button" aria-label={`ลดขนาดยา${label}`} onClick={() => setDose(kk, -1)}><Icon name="minus" /></button><output>{fr(x.doses[kk])}</output><button type="button" aria-label={`เพิ่มขนาดยา${label}`} onClick={() => setDose(kk, 1)}><Icon name="plus" /></button></div></div>)}</div></div>
        {!isNew && <ReasonBox required reason={x.reason} note={x.reasonNote} onReason={(v) => set({ reason: v })} onNote={(v) => set({ reasonNote: v })} />}
      </Body>
      <Footer>
        {isNew ? <Button onClick={() => go(`/medicine/${k}`)}>เสร็จ กลับไปหน้าเพิ่มยา</Button> : <>
          <Button disabled={!changed || !reasonOk} onClick={() => { setAck(false); setSheet(true); }}>ตรวจสอบก่อนบันทึก</Button>
          <p className="mut cap" style={{ textAlign: 'center' }}>{!changed ? 'ยังไม่ได้เปลี่ยนตาราง' : !reasonOk ? 'เลือกเหตุผลก่อนบันทึก' : ''}</p></>}
      </Footer>
      <Sheet open={sheet} onClose={() => setSheet(false)} label="ยืนยันการเปลี่ยนตาราง">
        <h2 style={{ fontSize: 22 }}>ยืนยันการเปลี่ยนตาราง</h2>
        <p className="mut sm" style={{ marginTop: -6 }}>{sub}</p>
        {x.base && <OldNew before={scheduleDoseText(x.base.schedule, x.base.doses, unit, today)} after={scheduleDoseText(x.schedule, x.doses, unit, today)} reason={x.reason ? x.reason + (x.reasonNote ? ` · ${x.reasonNote}` : '') : ''} />}
        <button type="button" className="ack" role="checkbox" aria-checked={ack} onClick={() => setAck(!ack)}><span className={`bx${ack ? ' on' : ''}`}>{ack && <Icon name="check" size={18} />}</span><span>ฉันตรวจสอบตารางนี้แล้ว</span></button>
        <Button disabled={!ack || !changed || !x.reason} onClick={confirm}>บันทึกตารางใหม่</Button>
        <Button variant="s" onClick={() => setSheet(false)}>กลับไปแก้</Button>
      </Sheet>
    </Screen>
  );
}
export type { MedDraft };
