import { Header, Body, Footer, Screen } from '../ui/Shell';
import { Button, Note, Pill } from '../ui/components';
import { Icon } from '../ui/Icon';
import { useRouter, queryOf } from '../router';
import { useStore } from '../store';
import { todayBangkok } from '../domain/dates';
import { personById } from '../domain/selectors';
import { currentTemplate, fillTemplate, orderLines, selectTemplate } from '../domain/order';

/** the same lines and pharmacy that screen 10 chose, read back from the address */
export function useOrderContext() {
  const { path } = useRouter();
  const { data: d } = useStore();
  const q = queryOf(path), skip = q.skip ? q.skip.split(',') : [];
  const lines = orderLines(d, todayBangkok(), q.of && personById(d, q.of) ? q.of : null).filter((l) => !skip.includes(l.a.id));
  const pharmacy = d.pharmacies.find((p) => p.id === q.ph) ?? d.pharmacies[0];
  return { q, lines, pharmacy, qs: path.includes('?') ? `?${path.split('?')[1]}` : '' };
}
export const messageFor = (d: ReturnType<typeof useStore>['data'], tplBody: string, ctx: ReturnType<typeof useOrderContext>) => fillTemplate(tplBody, ctx.pharmacy?.name ?? '', ctx.lines, d.household.name);

/** 11 Order message: pick a template, copy the text, open LINE by hand (PR-10, L-8) */
export function OrderMessage() {
  const { go } = useRouter();
  const { data: d, update, say } = useStore();
  const ctx = useOrderContext();
  const tpl = currentTemplate(d), text = messageFor(d, tpl.body, ctx);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); say('คัดลอกข้อความแล้ว เปิด LINE แล้ววางได้เลย'); }
    catch { say('คัดลอกไม่ได้ กดค้างที่ข้อความแล้วเลือกคัดลอก'); }
  };
  return (
    <Screen>
      <Header title="ข้อความสั่งยา" back={`/order${ctx.qs}`} pill={<Pill icon="edit" onClick={() => go(`/order/templates${ctx.qs}`)}>แก้แบบฟอร์ม</Pill>} />
      <Body gap={14}>
        <div className="fld"><span>แบบฟอร์มข้อความ</span>
          <div className="chips" role="group" aria-label="แบบฟอร์ม">
            {d.templates.map((t) => { const on = t.id === tpl.id; return <button key={t.id} type="button" className={`sch${on ? ' on' : ''}`} aria-pressed={on} onClick={() => update((x) => selectTemplate(x, t.id))}>{on && <Icon name="check" size={16} />}{t.name}</button>; })}
          </div>
        </div>
        <div className="msg" data-testid="msg">{text}</div>
        <Note icon="info">แอปไม่ส่งข้อความให้เอง คัดลอกข้อความนี้ แล้วเปิด LINE เพื่อวางและส่งด้วยตัวคุณเอง</Note>
      </Body>
      <Footer>
        <Button icon="copy" onClick={() => void copy()}>คัดลอกข้อความ</Button>
        <Button variant="s" onClick={() => say('เปิด LINE เองแล้ววางข้อความที่คัดลอกไว้')}>ฉันจะเปิด LINE เอง</Button>
      </Footer>
    </Screen>
  );
}
