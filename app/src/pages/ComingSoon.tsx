import { Header, Body, Screen } from '../ui/Shell';
import { Note } from '../ui/components';

export function ComingSoon({ title, nav }: { title: string; nav?: boolean }) {
  return (
    <Screen nav={nav}>
      <Header title={title} back={nav ? undefined : '/'} />
      <Body><Note icon="info">หน้านี้กำลังสร้างในขั้นถัดไป</Note></Body>
    </Screen>
  );
}
