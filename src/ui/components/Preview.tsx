import type { FunctionalComponent } from 'preact';
import type { TabName } from '../const';
import { h } from 'preact';
import { TABS } from '../const';

export interface Props {
  currentTab: TabName;
  hasError: boolean;
  html: string;
}

const Preview: FunctionalComponent<Props> = ({ currentTab, hasError, html }) => {
  return (
    <div
      aria-labelledby="tab-preview"
      class={`ap-panel ap-panel__preview${hasError ? ' has-error' : ''}`}
      hidden={currentTab !== TABS.PREVIEW}
      id="panel-preview"
      role="tabpanel"
    >
      <iframe class="ap-preview" srcDoc={html}></iframe>
    </div>
  );
};

export default Preview;
