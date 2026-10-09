import { useState } from 'react';
import { Header, Body, Footer, Screen } from '../ui/Shell';
import { Button, Field, Pill, TextInput } from '../ui/components';
import { Icon } from '../ui/Icon';
import { useRouter } from '../router';
import { useStore } from '../store';
import { newId } from '../domain/actions';
import { PLACEHOLDERS, saveTemplate, selectTemplate, templateError } from '../domain/order';
import { messageFor, useOrderContext } from './OrderMessage';

/** 11b Template editor: pick or add a template, edit name and text, insert placeholders, live preview (PR-10) */
export function TemplateEditor() {
  const { go } = useRouter();
  const { data: d, update, say } = useStore();
  const ctx = useOrderContext();
  const first = d.templates.find((t) => t.id === d.settings.selectedTemplateId) ?? d.templates[0]!;
  const [id, setId] = useState<string | null>(first.id);
  const [name, setName] = useState(first.name);
  const [body, setBody] = useState(first.body);
  const pick = (t: { id: string; name: string; body: string }) => { setId(t.id); setName(t.name); setBody(t.body); };
  const err = templateError(name, body);
  const save = () => {
    if (err) return;
    const nid = id ?? newId('t');
    if (update((x) => selectTemplate(saveTemplate(x, id, name, body, nid), nid))) { say('บันทึกแบบฟอร์มแล้ว'); go(`/order/message${ctx.qs}`); }
  };
  return (
    <Screen>
      <Header title="แบบฟอร์มข้อความ" back={`/order/message${ctx.qs}`} pill={<Pill icon="plus" onClick={() => { setId(null); setName(''); setBody(''); }}>ใหม่</Pill>} />
      <Body gap={14}>
        <div className="chips" role="group" aria-label="เลือกแบบฟอร์มที่จะแก้">
          {d.templates.map((t) => { const on = t.id === id; return <button key={t.id} type="button" className={`sch${on ? ' on' : ''}`} aria-pressed={on} onClick={() => pick(t)}>{on && <Icon name="check" size={16} />}{t.name}</button>; })}
          {id === null && <button type="button" className="sch on" aria-pressed="true"><Icon name="check" size={16} />แบบใหม่</button>}
        </div>
        <Field label="ชื่อแบบฟอร์ม">{(fid) => <TextInput id={fid} maxLength={30} value={name} onChange={(e) => setName(e.target.value)} />}</Field>
        <Field label="ข้อความ">{(fid) => <textarea id={fid} className="ta" maxLength={1000} value={body} onChange={(e) => setBody(e.target.value)} />}</Field>
        <div className="fld"><span>แตะเพื่อแทรกตัวแทน</span>
          <div className="chips">{PLACEHOLDERS.map((p) => <button key={p} type="button" className="sch" onClick={() => setBody(body + p)}>{p}</button>)}</div></div>
        <div className="fld"><span>ตัวอย่างข้อความ</span><div className="msg" data-testid="preview">{messageFor(d, body, ctx)}</div></div>
      </Body>
      <Footer>
        <Button disabled={!!err} onClick={save}>บันทึกแบบฟอร์ม</Button>
        {err && <p className="mut cap" style={{ textAlign: 'center' }}>{err}</p>}
      </Footer>
    </Screen>
  );
}
