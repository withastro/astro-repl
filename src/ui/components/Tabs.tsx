import type { FunctionalComponent } from 'preact';
import { h, Fragment } from 'preact';

const noop = () => {};

export interface Props {
  onAddTab: () => any;
  [key: string]: any;
}

const Tabs: FunctionalComponent<Props> = ({ onAddTab = noop, children }) => {
  return (
    <menu class="ap-tabgroup" role="tabgroup">
      {children}
      <button type="button" class="ap-tabgroup-action" onClick={() => onAddTab()}>
        <svg class="ap-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </menu>
  );
};

export default Tabs;
