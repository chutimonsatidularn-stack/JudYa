import { useState } from 'react';
import { Header, Body, Footer, Screen } from '../ui/Shell';
import { Button, Chip, Note, Pill, Sheet } from '../ui/components';
import { Icon } from '../ui/Icon';
import { OldNew, ReasonBox, STEPS } from './SchedulePage';
import { useRouter } from '../router';
import { useStore } from '../store';
import { applyDoseChange, ZERO } from '../domain/medicine';
import { describeChange, fr, PERIODS, scheduleDoseText, type PeriodKey } from '../domain/format';
import { newId } from '../domain/actions';
import { todayBangkok } from '../domain/dates';
import { medOf } from '../domain/selectors';
import type { Doses } from '../domain/schema';

/** 09 Adjust dose (DA-1…4): current dose, new dose with a step, what changes, reason (required), confirm sheet (09b), history and stop */
export function DosePage({ id }: { id: string }) {
  const { go } = useRouter();
  const { data: d, update, say } = useStore();
  const a = d.assignments.find((q) => q.id === id), med = a && medOf(d, a);
  const [doses, setDoses] = useState<Doses>(a ? { ...a.doses } : ZERO);
  const [step, setStep] = useState<1 | 0.5 | 0.25>(a?.doseStep ?? 0.5);
  const [reason, setReason] = useState(''), [note, setNote] = useState(''), [sheet, setSheet] = useState(false), [ack, setAck] = useState(false);
  const today = todayBangkok();
  if (!a || !med || !a.schedule || !a.active) return <Screen><Header title="ปรับโดส" back="/medicines" /><Body><Note icon="info">ไม่พบยานี้ หรือยานี้หยุดใช้แล้ว</Note></Body></Screen>;
  const unit = med.baseUnit, schedule = a.schedule;
  const diff = describeChange({ doses: a.doses, schedule }, { doses, schedule }, unit, today), changed = diff !== '';
  const setDose = (k: PeriodKey, dir: 1 | -1) => setDoses({ ...doses, [k]: Math.min(9, Math.max(0, +(doses[k] + dir * step).toFixed(2))) });
  const sub = `${med.generic} ${med.strength}`.trim();
  const confirm = () => {
    if (!ack || !changed || !reason) return;
    if (update((cur) => applyDoseChange(cur, id, { doses, schedule, doseStep: step }, reason, note, today, newId('dc'), new Date().toISOString()))) { say('บันทึกโดสใหม่แล้ว'); go(`/medicine/${id}`); }
  };
  return (
    <Screen>
      <Header title="ปรับโดส" sub={sub} back={`/medicine/${id}`} pill={<Pill icon="hist" onClick={() => go(`/medicine/${id}/history`)}>ประวัติ</Pill>} />
      <Body gap={14}>
        <div><h2 style={{ fontSize: 18, marginBottom: 6 }}>โดสปัจจุบัน</h2><div className="sum" style={{ background: 'var(--sky)' }}><b>{scheduleDoseText(schedule, a.doses, unit, today)}</b></div></div>
        <h2 style={{ fontSize: 18 }}>โดสใหม่</h2>
        <div className="fld"><span>กดแต่ละครั้งเปลี่ยนทีละ</span><div className="chips" role="group" aria-label="กดแต่ละครั้งเปลี่ยนทีละ">{STEPS.map((v) => <button key={v} type="button" className={`sch${step === v ? ' on' : ''}`} aria-pressed={step === v} onClick={() => setStep(v)}>{step === v && <Icon name="check" size={16} />}{fr(v)} {unit}</button>)}</div></div>
        <div className="card" style={{ padding: '4px 16px' }}>{PERIODS.map(([k, label]) => (
          <div key={k} className="dr"><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><b>{label}</b>{doses[k] !== a.doses[k] && <Chip tone="info">เปลี่ยน</Chip>}</span>
            <div className="step big"><button type="button" aria-label={`ลดขนาดยา${label}`} onClick={() => setDose(k, -1)}><Icon name="minus" /></button><output>{fr(doses[k])}</output><button type="button" aria-label={`เพิ่มขนาดยา${label}`} onClick={() => setDose(k, 1)}><Icon name="plus" /></button></div></div>))}</div>
        <div className="note cr"><Icon name="alert" size={20} /><span><b>สิ่งที่จะเปลี่ยน (ต้องยืนยันก่อนบันทึก)</b><br />{changed ? diff : 'ยังไม่ได้เปลี่ยน'}</span></div>
        <ReasonBox required reason={reason} note={note} onReason={setReason} onNote={setNote} />
      </Body>
      <Footer>
        <Button disabled={!changed || !reason} onClick={() => { setAck(false); setSheet(true); }}>ตรวจสอบก่อนบันทึก</Button>
        <p className="mut cap" style={{ textAlign: 'center' }}>{!changed ? 'ยังไม่ได้เปลี่ยนโดส' : !reason ? 'เลือกเหตุผลก่อนบันทึก' : ''}</p>
        <Button variant="d" icon="x" onClick={() => go(`/medicine/${id}/stop`)}>หยุดใช้ยา</Button>
      </Footer>
      <Sheet open={sheet} onClose={() => setSheet(false)} label="ยืนยันการเปลี่ยนโดส">
        <h2 style={{ fontSize: 22 }}>ยืนยันการเปลี่ยนโดส</h2><p className="mut sm" style={{ marginTop: -6 }}>{sub}</p>
        <OldNew before={scheduleDoseText(schedule, a.doses, unit, today)} after={scheduleDoseText(schedule, doses, unit, today)} reason={reason ? reason + (note ? ` · ${note}` : '') : ''} />
        <button type="button" className="ack" role="checkbox" aria-checked={ack} onClick={() => setAck(!ack)}><span className={`bx${ack ? ' on' : ''}`}>{ack && <Icon name="check" size={18} />}</span><span>ฉันตรวจสอบโดสนี้แล้ว</span></button>
        <Button disabled={!ack || !changed || !reason} onClick={confirm}>บันทึกโดสใหม่</Button>
        <Button variant="s" onClick={() => setSheet(false)}>กลับไปแก้</Button>
      </Sheet>
    </Screen>
  );
}
