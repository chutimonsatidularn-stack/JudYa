import { RouterProvider, useRouter, match } from './router';
import { StoreProvider, useStore } from './store';
import { DraftProvider, useDraft } from './draft';
import { Home } from './pages/Home';
import { Notifications } from './pages/Notifications';
import { Today } from './pages/Today';
import { Members } from './pages/Members';
import { MemberPage } from './pages/MemberPage';
import { MemberForm } from './pages/MemberForm';
import { AvatarPick } from './pages/AvatarPick';
import { RemoveMember } from './pages/RemoveMember';
import { AllergyForm } from './pages/AllergyForm';
import { Medicines } from './pages/Medicines';
import { MedicineForm } from './pages/MedicineForm';
import { BuyPage } from './pages/BuyPage';
import { SchedulePage } from './pages/SchedulePage';
import { Gallery } from './pages/Gallery';
import { ComingSoon } from './pages/ComingSoon';
import { LoadError } from './pages/LoadError';
import { Toast } from './ui/components';
import { setAvatar } from './domain/actions';
import { personById } from './domain/selectors';
import type { Store } from './domain/storage';

function Page() {
  const { path, go } = useRouter();
  const { data, update, say } = useStore();
  const { draft, setDraft } = useDraft();
  let m: Record<string, string> | null;
  if (path === '/') return <Home />;
  if (path === '/notifications') return <Notifications />;
  if ((m = match('/today/:p', path))) return <Today filter={m.p as string} />;
  if (path === '/today') return <Today filter="all" />;
  if (path === '/members') return <Members />;
  if (path === '/members/new') return <MemberForm id={null} />;
  if (path === '/members/new/avatar') return <AvatarPick current={draft?.avatarId} back="/members/new" sub={draft?.name.trim() || 'สมาชิกใหม่'} onSave={(a) => { if (draft) setDraft({ ...draft, avatarId: a }); go('/members/new'); }} />;
  if ((m = match('/member/:id/edit/avatar', path))) { const id = m.id as string; return <AvatarPick current={draft?.avatarId} back={`/member/${id}/edit`} sub={draft?.name.trim()} onSave={(a) => { if (draft) setDraft({ ...draft, avatarId: a }); go(`/member/${id}/edit`); }} />; }
  if ((m = match('/member/:id/avatar', path))) { const id = m.id as string; const p = personById(data, id); return <AvatarPick current={p?.avatarId} back={`/member/${id}`} sub={p?.name} onSave={(a) => { if (update((x) => setAvatar(x, id, a))) { say('เปลี่ยนรูปโปรไฟล์แล้ว'); go(`/member/${id}`); } }} />; }
  if ((m = match('/member/:id/edit', path))) return <MemberForm id={m.id as string} />;
  if ((m = match('/member/:id/remove', path))) return <RemoveMember id={m.id as string} />;
  if ((m = match('/member/:id/allergy/:aid', path))) return <AllergyForm personId={m.id as string} allergyId={m.aid as string} />;
  if ((m = match('/member/:id/allergy', path))) return <AllergyForm personId={m.id as string} />;
  if ((m = match('/member/:id', path))) return <MemberPage id={m.id as string} />;
  if (path === '/medicines') return <Medicines />;
  if ((m = match('/medicine/:x/buy', path))) return <BuyPage k={m.x as string} />;
  if ((m = match('/medicine/:x/schedule', path))) return <SchedulePage k={m.x as string} />;
  if ((m = match('/medicine/:x/dose', path))) return <ComingSoon title="ปรับโดส" />;
  if ((m = match('/medicine/:x', path))) return <MedicineForm k={m.x as string} />;
  if (path === '/gallery') return <Gallery />;
  if (path === '/share') return <ComingSoon title="แชร์ข้อมูลยา" nav />;
  if (path === '/settings') return <ComingSoon title="ตั้งค่า" nav />;
  return <ComingSoon title="หน้านี้" />;
}

function Routes() {
  const { loadError, toast, saveError } = useStore();
  if (loadError) return <LoadError message={loadError} />;
  return <><Page />{saveError && <div className="toast" role="alert" style={{ background: 'var(--dngink)' }}>{saveError}</div>}<Toast message={toast} /></>;
}

export default function App({ store }: { store: Store }) {
  return <StoreProvider store={store}><DraftProvider><RouterProvider><div className="app"><Routes /></div></RouterProvider></DraftProvider></StoreProvider>;
}
