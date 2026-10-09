// Clean-line icon set (24 px box, 2 px stroke, round caps) copied from the approved prototype. Path data only, so it is safe
// to render with dangerouslySetInnerHTML below: these strings are constants, never user input (SEC-1).
export const ICONS: Record<string, string> = {
 back:'<path d="M15 5l-7 7 7 7"/>',chev:'<path d="M9 5l7 7-7 7"/>',check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
 moon:'<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
 alert:'<path d="M12 3l10 18H2L12 3zM12 10v5M12 18h.01"/>',bell:'<path d="M6 16v-5a6 6 0 1112 0v5l2 2H4l2-2zM10 21h4"/>',
 home:'<path d="M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6"/>',bag:'<path d="M5 8h14l-1 12H6L5 8zM9 8a3 3 0 016 0"/>',
 share:'<path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14"/>',
 gear:'<path d="M4 6h8M16 6h4M4 12h4M12 12h8M4 18h10M18 18h2"/><circle cx="14" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>',
 copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/>',
 lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
 camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
 pill:'<path d="M10.5 20.5a5 5 0 01-7-7l10-10a5 5 0 017 7l-10 10zM8.5 8.5l7 7"/>',
 store:'<path d="M4 9l1-5h14l1 5M4 9a3 3 0 006 0 3 3 0 006 0 3 3 0 004 0M5 12v8h14v-8M10 20v-5h4v5"/>',
 down:'<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',up:'<path d="M12 15V3M7 8l5-5 5 5M4 20h16"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 edit:'<path d="M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4"/>',steth:'<path d="M6 3v6a4 4 0 008 0V3M10 13v2a5 5 0 0010 0v-1"/><circle cx="20" cy="12" r="2"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',chat:'<path d="M4 5h16v11H9l-5 4V5z"/>',
 arrdown:'<path d="M12 4v16M6 14l6 6 6-6"/>',phone:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
 img:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5L5 20"/>',
 caret:'<path d="M6 9l6 6 6-6"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',
 call:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
 hist:'<path d="M3 12a9 9 0 109-9 9 9 0 00-7 3.5M3 4v4h4M12 8v4l3 2"/>'
};
