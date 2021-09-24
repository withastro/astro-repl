import type { FunctionalComponent } from 'preact';
import type { TabName } from '../const';
import { h } from 'preact';
import { TABS } from '../const';

export interface Props {
  html: string;
  currentTab: TabName;
  hasError: boolean;
}

const HTML: FunctionalComponent<Props> = ({ html, hasError, currentTab }) => {
  return (
    <div
      aria-labelledby="tab-html"
      class={`ap-panel ap-panel__html${hasError ? ' has-error' : ''}`}
      hidden={currentTab !== TABS.HTML}
      dangerouslySetInnerHTML={{ __html: html }}
      id="panel-html"
      role="tabpanel"
    />
  );
};

export default HTML;
