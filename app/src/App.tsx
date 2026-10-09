import { RouterProvider, useRouter } from './router';
import { StoreProvider, useStore } from './store';
import { Home } from './pages/Home';
import { Gallery } from './pages/Gallery';
import { ComingSoon } from './pages/ComingSoon';
import { LoadError } from './pages/LoadError';
import { Toast } from './ui/components';
import type { Store } from './domain/storage';

function Routes() {
  const { path } = useRouter();
  const { loadError, toast, saveError } = useStore();
  if (loadError) return <LoadError message={loadError} />;
  const page = (() => {
    if (path === '/') return <Home />;
    if (path === '/gallery') return <Gallery />;
    if (path === '/medicines') return <ComingSoon title="ยา" nav />;
    if (path === '/share') return <ComingSoon title="แชร์ข้อมูลยา" nav />;
    if (path === '/settings') return <ComingSoon title="ตั้งค่า" nav />;
    return <ComingSoon title="หน้านี้" />;
  })();
  return <>{page}{saveError && <div className="toast" role="alert" style={{ background: 'var(--dngink)' }}>{saveError}</div>}<Toast message={toast} /></>;
}

export default function App({ store }: { store: Store }) {
  return <StoreProvider store={store}><RouterProvider><div className="app"><Routes /></div></RouterProvider></StoreProvider>;
}
