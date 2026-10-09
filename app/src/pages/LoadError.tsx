import { Header, Body, Screen } from '../ui/Shell';
import { Note } from '../ui/components';

/** Saved data could not be read. The app shows why and changes nothing (ADR-0007, SEC-2). */
export function LoadError({ message }: { message: string }) {
  return (
    <Screen>
      <Header title="เปิดข้อมูลไม่ได้" />
      <Body>
        <Note tone="danger" icon="alert"><b>{message}</b><br />แอปยังไม่แก้หรือลบข้อมูลในเครื่องของคุณ กรุณาบอกผู้ช่วยพัฒนาก่อนทำอย่างอื่น</Note>
      </Body>
    </Screen>
  );
}
