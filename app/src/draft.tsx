// The add/edit-member form is spread over two screens (form → choose picture → back), so its unsaved text lives here.
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { MemberForm } from './domain/actions';

type D = { draft: MemberForm | null; setDraft: (f: MemberForm | null) => void };
const Ctx = createContext<D>({ draft: null, setDraft: () => {} });
export function DraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<MemberForm | null>(null);
  return <Ctx.Provider value={{ draft, setDraft }}>{children}</Ctx.Provider>;
}
export const useDraft = () => useContext(Ctx);
