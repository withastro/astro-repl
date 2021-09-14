import type { FunctionalComponent } from 'preact';
import type { TabName } from '../const';
import { h } from 'preact';
import { TABS } from '../const';

export interface Props {
  code: string;
  currentTab: TabName;
  hasError: boolean;
}

const JS: FunctionalComponent<Props> = ({ code, hasError, currentTab }) => {
  return (
    <div
      aria-labelledby="tab-js"
      class={`ap-panel ap-panel__js${hasError ? ' has-error' : ''}`}
      dangerouslySetInnerHTML={{ __html: code }}
      hidden={currentTab !== TABS.JS}
      id="panel-js"
      role="tabpanel"
    />
  );
};

export default JS;
