import { describe, expect, it } from 'vitest';
import * as a from '../actions';
import { demoData, TODAY } from '../__fixtures__/demo';
import { AppData } from '../schema';
import { members, removedMembers, assignmentsOfPerson } from '../selectors';

const form = (o: Partial<a.MemberForm> = {}): a.MemberForm => ({ id: null, name: 'คุณลุง', relationship: 'ปู่ย่าตายาย', birthYear: '2490', avatarId: 'profile-13', ...o });

describe('member actions (MB-5…MB-9)', () => {
  it('validation: name required, ≤ 40, not a repeat; birth year range', () => {
    const d = demoData();
    expect(a.memberError(d, form({ name: ' ' }), TODAY)).toBe('ใส่ชื่อก่อน');
    expect(a.memberError(d, form({ name: 'คุณพ่อ' }), TODAY)).toBe('มีสมาชิกชื่อนี้แล้ว');
    expect(a.memberError(d, form({ name: 'ก'.repeat(41) }), TODAY)).toContain('40');
    expect(a.memberError(d, form({ birthYear: '1999' }), TODAY)).toContain('2400–2569');
    expect(a.memberError(d, form({ birthYear: '' }), TODAY)).toBe('');
    expect(a.memberError(d, form({ id: 'p_dad', name: 'คุณพ่อ' }), TODAY)).toBe(''); // editing yourself is not a repeat
  });
  it('age from birth year', () => { expect(a.ageFromBirthYear('2490', TODAY)).toBe(79); expect(a.ageFromBirthYear('abc', TODAY)).toBeNull(); expect(a.ageFromBirthYear(undefined, TODAY)).toBeNull(); });
  it('add / edit / remove / restore keep the data valid and keep medicines', () => {
    let d = a.addMember(demoData(), form(), 'p_new');
    expect(AppData.safeParse(d).success).toBe(true); expect(d.persons.at(-1)).toMatchObject({ id: 'p_new', name: 'คุณลุง', birthYear: 2490, avatarId: 'profile-13', selfManaged: false });
    d = a.updateMember(d, form({ id: 'p_new', name: 'คุณลุงสมชาย', relationship: '', birthYear: '' }));
    const p = d.persons.find((x) => x.id === 'p_new')!; expect(p.name).toBe('คุณลุงสมชาย'); expect('relationship' in p).toBe(false); expect('birthYear' in p).toBe(false);
    const before = assignmentsOfPerson(d, 'p_dad').length;
    d = a.setRemoved(d, 'p_dad', true);
    expect(members(d).map((x) => x.id)).not.toContain('p_dad'); expect(removedMembers(d).map((x) => x.id)).toEqual(['p_dad']);
    d = a.setRemoved(d, 'p_dad', false);
    expect(members(d).map((x) => x.id)).toContain('p_dad'); expect('removed' in d.persons[0]!).toBe(false); expect(assignmentsOfPerson(d, 'p_dad')).toHaveLength(before);
    expect(AppData.safeParse(d).success).toBe(true);
  });
  it('self-manage switch and avatar', () => {
    let d = a.setSelfManaged(demoData(), 'p_dad', true); expect(d.persons[0]!.selfManaged).toBe(true);
    d = a.setAvatar(d, 'p_dad', 'profile-07'); expect(d.persons[0]!.avatarId).toBe('profile-07');
  });
});

describe('allergy actions (AL-1…AL-4)', () => {
  it('needs a drug and at least one symptom', () => { expect(a.allergyValid({ drug: 'x', symptoms: [], note: '' })).toBe(false); expect(a.allergyValid({ drug: ' ', symptoms: ['คัน'], note: '' })).toBe(false); expect(a.allergyValid({ drug: 'Aspirin', symptoms: ['คัน'], note: '' })).toBe(true); });
  it('add, edit keeps the original date, delete', () => {
    let d = a.saveAllergy(demoData(), 'p_dad', { drug: ' Aspirin ', symptoms: ['ผื่น/ลมพิษ', 'หายใจลำบาก'], note: '' }, TODAY, 'al1');
    expect(d.allergies[0]).toEqual({ id: 'al1', personId: 'p_dad', drug: 'Aspirin', symptoms: ['ผื่น/ลมพิษ', 'หายใจลำบาก'], recordedOn: TODAY, source: 'manual' });
    d = a.saveAllergy(d, 'p_dad', { drug: 'Aspirin', symptoms: ['คัน'], note: 'หลัง 2 วัน' }, '2027-01-01', 'zz', 'al1');
    expect(d.allergies[0]).toMatchObject({ symptoms: ['คัน'], note: 'หลัง 2 วัน', recordedOn: TODAY });
    expect(AppData.safeParse(d).success).toBe(true);
    d = a.deleteAllergy(d, 'al1'); expect(d.allergies).toEqual([]);
  });
});

describe('ticks (NV-4)', () => {
  it('toggle on/off, and a new day starts clean', () => {
    let d = a.toggleTick(demoData(), 'a_dad_los:morning', TODAY); expect(d.ticks).toEqual({ date: TODAY, done: ['a_dad_los:morning'] });
    d = a.toggleTick(d, 'a_dad_los:morning', TODAY); expect(d.ticks!.done).toEqual([]);
    d = a.toggleTick(a.toggleTick(demoData(), 'x:morning', '2026-10-07'), 'y:morning', TODAY); expect(d.ticks).toEqual({ date: TODAY, done: ['y:morning'] });
  });
});
