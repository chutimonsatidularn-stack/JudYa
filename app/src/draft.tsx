// Forms spread over several screens (form → choose picture / buy / schedule → back) keep their unsaved text here.
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MemberForm } from './domain/actions';
import type { MedDraft } from './domain/medicine';

type D = { draft: MemberForm | null; setDraft: (f: MemberForm | null) => void; med: MedDraft | null; setMed: (m: MedDraft | null) => void };
const Ctx = createContext<D>({ draft: null, setDraft: () => {}, med: null, setMed: () => {} });
export function DraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<MemberForm | null>(null);
  const [med, setMed] = useState<MedDraft | null>(null);
  return <Ctx.Provider value={{ draft, setDraft, med, setMed }}>{children}</Ctx.Provider>;
}
export const useDraft = () => useContext(Ctx);
