/** all REPL tabs (used mostly for typechecking) */
export type TabName = 'CODE' | 'PREVIEW' | 'HTML' | 'JS';
export const TABS: Record<TabName, TabName> = {
  CODE: 'CODE', // note: mobile-only tab
  PREVIEW: 'PREVIEW',
  HTML: 'HTML',
  JS: 'JS',
};
