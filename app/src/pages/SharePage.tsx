import { Header, Body, Footer, Screen } from '../ui/Shell';
import { Button, Note, Switch } from '../ui/components';
import { Icon } from '../ui/Icon';
import { useRouter, queryOf } from '../router';
import { useStore } from '../store';
import { todayBangkok } from '../domain/dates';
import { members } from '../domain/selectors';
import { setShare, SHARE_ROWS, sharesOn, summaryText } from '../domain/summary';

/** 13 Share: choose a person and what to include, then copy a summary text; nothing is sent by the app (UI-6, D-6) */
export function SharePage() {
  const { go, path } = useRouter();
  const { data: d, update, say } = useStore();
  const ppl = members(d), q = queryOf(path).p;
  const who = ppl.find((p) => p.id === q) ?? ppl[0];
  const copy = async () => {
    if (!who) return;
    try { await navigator.clipboard.writeText(summaryText(d, who.id, todayBangkok())); say('คัดลอกข้อความสรุปแล้ว ส่งผ่านแอปที่คุณเลือกเอง'); }
    catch { say('คัดลอกไม่ได้ ลองอีกครั้ง'); }
  };
  return (
    <Screen nav>
      <Header title="แชร์ข้อมูลยา" />
      <Body gap={12}>
        <Note tone="caution" icon="lock"><span><b>ข้อมูลยาเป็นข้อมูลส่วนตัว</b><br />ส่งให้เฉพาะคนที่คุณไว้ใจ และตรวจข้อความก่อนส่งทุกครั้ง</span></Note>
        {!who ? <Note icon="info">ยังไม่มีสมาชิก เพิ่มสมาชิกก่อนจึงจะแชร์ได้</Note> : <>
          <div className="chips" role="group" aria-label="เลือกคน">
            {ppl.map((p) => { const on = p.id === who.id; return <button key={p.id} type="button" className={`sch${on ? ' on' : ''}`} aria-pressed={on} onClick={() => go(`/share?p=${p.id}`)}>{on && <Icon name="check" size={16} />}{p.name}</button>; })}
          </div>
          <div className="card" style={{ padding: '4px 16px' }}>
            {SHARE_ROWS.map((r) => <Switch key={r.key} title={r.title} text={r.text} checked={sharesOn(d.settings.shares, r.key)} onChange={(v) => update((x) => setShare(x, r.key, v))} />)}
          </div>
          <p className="mut sm">บันทึกแพ้ยาจะแนบไปด้วยเสมอ เพื่อความปลอดภัย</p>
          <button type="button" className="card tap" onClick={() => go(`/doctor/${who.id}`)}><span className="disc"><Icon name="steth" size={22} /></span><span className="grow"><b>สรุปสำหรับพบแพทย์</b><br /><span className="mut cap">เปิดหน้าสรุปที่อ่านง่าย</span></span><Icon name="chev" size={20} /></button>
        </>}
      </Body>
      {who && <Footer><Button icon="copy" onClick={() => void copy()}>คัดลอกข้อความสรุป</Button></Footer>}
    </Screen>
  );
}
