import type { FunctionalComponent } from 'preact';
import type { TabName } from '../const';
import { h } from 'preact';
import { TABS } from '../const';

export interface Props {
  html: string;
  currentTab: TabName;
  hasError: boolean;
}

function escapeHTML(value: string) {
  return value.replace(/["'&<>]/g, (c: string) => {
    switch (c.charCodeAt(0)) {
      case 34: return '&quot;'
      case 38: return '&amp;'
      case 39: return '&#39;'
      case 60: return '&lt;'
      case 62: return '&gt;'
    }
  })
}

const HTML: FunctionalComponent<Props> = ({ html, hasError, currentTab }) => {
  return (
    <div
      aria-labelledby="tab-html"
      class={`ap-panel ap-panel__html${hasError ? ' has-error' : ''}`}
      hidden={currentTab !== TABS.HTML}
      id="panel-html"
      role="tabpanel"
    >
      <pre dangerouslySetInnerHTML={{ __html: escapeHTML(html) }}></pre>
    </div>
  );
};

export default HTML;
