import { useState } from 'react';
import { Header, Body, Footer, Screen } from '../ui/Shell';
import { Button } from '../ui/components';
import { Icon } from '../ui/Icon';
import { AVATARS, getAvatar } from '../ui/avatars';

/** 07e Choose profile picture: the 20 icons, the chosen one has a check badge + dark frame; going back changes nothing (MB-1) */
export function AvatarPick({ title = 'เลือกรูปโปรไฟล์', sub, current, onSave, back }: { title?: string; sub?: string; current?: string; onSave: (avatarId: string) => void; back: string }) {
  const [sel, setSel] = useState(getAvatar(current).id);
  const a = getAvatar(sel);
  return (
    <Screen>
      <Header title={title} sub={sub} back={back} />
      <Body>
        <div style={{ display: 'flex', justifyContent: 'center' }}><img className="av xl" style={{ width: 96, height: 96, background: a.bg }} src={a.src} alt={a.alt} /></div>
        <div className="avgrid" role="group" aria-label="รูปโปรไฟล์ 20 แบบ">
          {AVATARS.map((x, i) => (
            <button key={x.id} type="button" className={`avb${x.id === sel ? ' on' : ''}`} aria-pressed={x.id === sel} aria-label={`รูปที่ ${i + 1}`} onClick={() => setSel(x.id)}>
              <img src={x.src} alt="" style={{ background: x.bg }} />{x.id === sel && <span className="avck"><Icon name="check" size={16} /></span>}
            </button>
          ))}
        </div>
      </Body>
      <Footer><Button onClick={() => onSave(sel)}>ใช้รูปนี้</Button></Footer>
    </Screen>
  );
}
