import type { FunctionalComponent } from 'preact';
import type { TabName } from '../const';
import { h } from 'preact';
import { TABS } from '../const';

export interface Props {
  currentTab: TabName;
  hasError: boolean;
  html: string;
  loading: boolean;
}

const Preview: FunctionalComponent<Props> = ({ currentTab, hasError, html, loading }) => {
  return (
    <div
      aria-labelledby="tab-preview"
      class={`ap-panel ap-panel__preview${hasError ? ' has-error' : ''}${loading ? " load" : ""}`}
      hidden={currentTab !== TABS.PREVIEW}
      id="panel-preview"
      role="tabpanel"
    >
      <div class="loading-container">
        <div class="loader"></div>
      </div>
      <iframe class="ap-preview" srcDoc={html}></iframe>
    </div>
  );
};

export default Preview;
