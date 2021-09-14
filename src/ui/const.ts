/** all REPL tabs (used mostly for typechecking) */
export type TabName = 'CODE' | 'PREVIEW' | 'JS';
export const TABS: Record<TabName, TabName> = {
  CODE: 'CODE', // note: mobile-only tab
  PREVIEW: 'PREVIEW',
  JS: 'JS',
};
