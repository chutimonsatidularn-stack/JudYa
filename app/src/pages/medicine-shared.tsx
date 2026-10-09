import { useEffect } from 'react';
import { useDraft } from '../draft';
import { useRouter, queryOf } from '../router';
import { useStore } from '../store';
import { draftFromAssignment, HOUSE, newDraft, type MedDraft } from '../domain/medicine';
import { members } from '../domain/selectors';

/** The draft shared by 08 / 08d / 08c. It is created once per medicine (key) and kept while the user moves between the three screens. */
export function useMedDraft(key: string): { x: MedDraft | null; set: (o: Partial<MedDraft>) => void } {
  const { path, prev } = useRouter();
  const { data: d } = useStore();
  const { med, setMed } = useDraft();
  const x = med && med.key === key ? med : null;
  useEffect(() => {
    if (x) return;
    const from = prev.startsWith('/medicine') || prev === path ? '/medicines' : prev;
    if (key === 'new') { const o = queryOf(path).owner; setMed(newDraft(o && (o === HOUSE || d.persons.some((p) => p.id === o)) ? o : members(d)[0]?.id ?? HOUSE, from)); return; }
    const a = d.assignments.find((q) => q.id === key); const nd = a ? draftFromAssignment(d, a, from) : null; if (nd) setMed(nd);
  }, [x, key, d, path, prev, setMed]);
  return { x, set: (o) => x && setMed({ ...x, ...o }) };
}
