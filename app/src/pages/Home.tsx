import { Banner, Button } from '../ui/components';
import { Icon } from '../ui/Icon';
import { HomeBanner } from '../ui/HomeBanner';
import { Body, Footer, Screen } from '../ui/Shell';
import { PersonRow, SectionTitle } from './shared';
import { useRouter } from '../router';
import { useStore } from '../store';
import { thaiDateLabel, todayBangkok } from '../domain/dates';
import { getHomeBannerState, homeBannerInput, lowAssignments, medOf, members, notifCount, personById, stockOf } from '../domain/selectors';
import { medTitle } from '../domain/format';

/** 06 Home: action-first (NV-2). Greeting card with the 3-state picture (UI-10), banner for medicines near running out, members. */
export function Home() {
  const { go } = useRouter();
  const { data: d } = useStore();
  const today = todayBangkok();
  const people = members(d), low = lowAssignments(d, today), n = notifCount(d, today);
  const first = low[0], firstMed = first && medOf(d, first), firstOwner = first && first.owner.kind === 'person' ? personById(d, first.owner.personId) : undefined;
  return (
    <Screen nav>
      <div className="top">
        <img className="ico" src={`${import.meta.env.BASE_URL}icon.svg`} alt="JudYa" />
        <div className="tt"><b>{d.household.name}</b><small>{thaiDateLabel(today)}</small></div>
        <button type="button" className="ib sky" onClick={() => go('/notifications')} aria-label={`การแจ้งเตือน ${n} รายการ`}>
          <Icon name="bell" />{n > 0 && <span className="dot-n" aria-hidden="true">{n}</span>}
        </button>
      </div>
      <Body gap={14}>
        <HomeBanner state={getHomeBannerState(homeBannerInput(d, today))} />
        {first && firstMed && <Banner title={`ยาใกล้หมด ${low.length} รายการ`} text={`${medTitle(firstMed)} ของ${firstOwner?.name ?? ''} เหลือ ${stockOf(d, first, today).days} วัน`} onClick={() => go('/order')} />}
        {people.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 24 }}>
            <b style={{ fontSize: 20 }}>ยังไม่มีสมาชิก</b>
            <p className="mut sm" style={{ margin: '6px 0 14px' }}>เริ่มจากเพิ่มคนที่คุณดูแลยาให้ แล้วค่อยใส่ยาของเขา ข้อมูลทั้งหมดเก็บในเครื่องนี้เท่านั้น</p>
            <Button icon="plus" onClick={() => go('/members/new')}>เพิ่มสมาชิก</Button>
          </div>
        ) : (
          <>
            <SectionTitle title="สมาชิก" action={{ label: 'ดูทั้งหมด', onClick: () => go('/members') }} />
            <div className="list" style={{ gap: 8, marginTop: -6 }}>{people.map((p) => <PersonRow key={p.id} d={d} p={p} today={today} onClick={() => go(`/member/${p.id}`)} />)}</div>
          </>
        )}
      </Body>
      {people.length > 0 && <Footer><Button icon="bag" onClick={() => go('/order')}>เตรียมสั่งยา</Button></Footer>}
    </Screen>
  );
}
