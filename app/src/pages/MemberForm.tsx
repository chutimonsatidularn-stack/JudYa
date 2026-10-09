import { useEffect } from 'react';
import { Header, Body, Footer, Screen } from '../ui/Shell';
import { Avatar, Button, ChipGroup, Field, Pill, TextInput } from '../ui/components';
import { useRouter } from '../router';
import { useStore } from '../store';
import { useDraft } from '../draft';
import { todayBangkok } from '../domain/dates';
import { ageFromBirthYear, addMember, memberError, newId, RELATIONS, updateMember, type MemberForm as Form } from '../domain/actions';
import { personById } from '../domain/selectors';
import { DEFAULT_AVATAR_ID } from '../ui/avatars';

/** 07f Add / edit member (MB-5, MB-6). The unsaved text lives in the draft so choosing a picture does not lose it. */
export function MemberForm({ id }: { id: string | null }) {
  const { go } = useRouter();
  const { data: d, update, say } = useStore();
  const { draft, setDraft } = useDraft();
  const today = todayBangkok(), add = id === null, p = id ? personById(d, id) : undefined;
  const f: Form | null = draft && draft.id === id ? draft : null;
  useEffect(() => {
    if (f) return;
    if (add) setDraft({ id: null, name: '', relationship: '', birthYear: '', avatarId: DEFAULT_AVATAR_ID });
    else if (p) setDraft({ id: p.id, name: p.name, relationship: p.relationship ?? '', birthYear: p.birthYear ? String(p.birthYear) : '', avatarId: p.avatarId ?? DEFAULT_AVATAR_ID });
  }, [f, add, p, setDraft]);
  if (!f) return <Screen><Header title={add ? 'เพิ่มสมาชิก' : 'แก้ไขข้อมูลสมาชิก'} back={add ? '/members' : `/member/${id}`} /><Body><p className="mut">กำลังเปิด…</p></Body></Screen>;
  const set = (o: Partial<Form>) => setDraft({ ...f, ...o });
  const err = memberError(d, f, today), age = ageFromBirthYear(f.birthYear, today);
  const leave = (to: string) => { setDraft(null); go(to); };
  const save = () => {
    if (err) return;
    if (add) { const nid = newId('p'); if (update((x) => addMember(x, f, nid))) { say(`เพิ่ม${f.name.trim()}แล้ว`); leave('/members'); } }
    else if (update((x) => updateMember(x, f))) { say('บันทึกข้อมูลแล้ว'); leave(`/member/${id}`); }
  };
  return (
    <Screen>
      <Header title={add ? 'เพิ่มสมาชิก' : 'แก้ไขข้อมูลสมาชิก'} back={() => leave(add ? '/members' : `/member/${id}`)} />
      <Body>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar avatarId={f.avatarId} size="xl" />
          <Pill icon="edit" onClick={() => go(add ? '/members/new/avatar' : `/member/${id}/edit/avatar`)}>เปลี่ยนรูป</Pill>
        </div>
        <Field label="ชื่อ">{(fid) => <TextInput id={fid} maxLength={40} value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="เช่น คุณลุง" />}</Field>
        <div className="fld"><span>ความสัมพันธ์ (ไม่บังคับ)</span><ChipGroup label="ความสัมพันธ์" options={RELATIONS} value={f.relationship as (typeof RELATIONS)[number] | ''} onChange={(v) => set({ relationship: f.relationship === v ? '' : v })} /></div>
        <Field label="ปีเกิด พ.ศ. (ไม่บังคับ)" hint={age != null ? `อายุประมาณ ${age} ปี` : undefined}>{(fid) => <TextInput id={fid} inputMode="numeric" maxLength={4} value={f.birthYear} onChange={(e) => set({ birthYear: e.target.value })} placeholder="เช่น 2500" />}</Field>
        {!add && <><div className="hr" /><Button variant="d" onClick={() => go(`/member/${id}/remove`)}>นำ{f.name.trim() || 'สมาชิก'}ออกจากรายชื่อ</Button><span className="hx">ไม่ได้ลบ ยาและประวัติยังเก็บไว้ และนำกลับได้</span></>}
      </Body>
      <Footer>
        <Button disabled={!!err} onClick={save}>{add ? 'เพิ่มสมาชิก' : 'บันทึก'}</Button>
        {err && <p className="mut cap" style={{ textAlign: 'center' }}>{err}</p>}
      </Footer>
    </Screen>
  );
}
