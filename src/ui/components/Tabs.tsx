import type { FunctionalComponent } from 'preact';
import { h, Fragment } from 'preact';

const noop = () => {};

export interface Props {
    onAddTab: () => any;
    [key: string]: any;
}

const Tabs: FunctionalComponent<Props> = ({ onAddTab = noop, children }) => {
  return (
    <menu class="ap-preview-menu">
      <ul role="tabgroup" class="ap-preview-tabs">
        {children}
        <li class="ap-preview-tabwrapper ap-preview-tabwrapper-add">
          <button type="button" class="ap-preview-tab ap-preview-tab-add" onClick={() => onAddTab()}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </li>
      </ul>
    </menu>
  );
};

export default Tabs;
