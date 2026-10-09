import { Button, Card } from '../ui/components';
import { Icon } from '../ui/Icon';
import { Body, Footer, Screen } from '../ui/Shell';
import { useRouter } from '../router';
import { useStore } from '../store';
import { thaiDateLabel, todayBangkok } from '../domain/dates';

/** Step 2 shows the real first-run Home (nothing entered yet). The full Home comes in Step 3. */
export function Home() {
  const { go } = useRouter();
  const { data } = useStore();
  const empty = data.persons.length === 0;
  return (
    <Screen nav>
      <div className="top">
        <img className="ico" src={`${import.meta.env.BASE_URL}icon.svg`} alt="JudYa" />
        <div className="tt"><b>{data.household.name}</b><small>{thaiDateLabel(todayBangkok())}</small></div>
        <button type="button" className="ib sky" onClick={() => go('/notifications')} aria-label="การแจ้งเตือน 0 รายการ"><Icon name="bell" /></button>
      </div>
      <Body gap={14}>
        {empty && (
          <Card className="empty">
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <b style={{ fontSize: 20 }}>ยังไม่มีสมาชิก</b>
              <p className="mut sm" style={{ margin: '6px 0 14px' }}>เริ่มจากเพิ่มคนที่คุณดูแลยาให้ แล้วค่อยใส่ยาของเขา ข้อมูลทั้งหมดเก็บในเครื่องนี้เท่านั้น</p>
              <Button icon="plus" onClick={() => go('/members/new')}>เพิ่มสมาชิก</Button>
            </div>
          </Card>
        )}
      </Body>
      {!empty && <Footer><Button icon="bag" onClick={() => go('/order')}>เตรียมสั่งยา</Button></Footer>}
    </Screen>
  );
}
