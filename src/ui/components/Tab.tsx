import type { editor as Editor } from 'monaco-editor';
import type { FunctionalComponent } from 'preact';
import { h } from 'preact';
import { basename } from '../../utils/loader';
// import { posix } from 'path';

const noop = () => {};

export interface Props {
  'aria-selected': boolean;
  index: number;
  model: Editor.IModel;
  onRemoveTab?: (model: Editor.IModel) => void;
  onSetTab?: (model: Editor.IModel) => void;
}
const Tab: FunctionalComponent<Props> = ({ 'aria-selected': active = false, index, onRemoveTab = noop, onSetTab = noop, model }) => {
  const tabName = basename(model.uri.path);
  return (
    <div class={`ap-tabgroup-tabwrapper${index !== 0 ? ' is-removable' : ''}`}>
      <button role="tab" type="button" aria-selected={active} aria-controls="editor" class="ap-tabgroup-tab" onClick={() => onSetTab(model)}>
        {tabName}
      </button>
      {index !== 0 && (
        <button
          type="button"
          class="ap-tabgroup-remove"
          onClick={() => (confirm(`Delete ${tabName}? This can’t be undone.`) ? onRemoveTab(model) : {})}
        >
          <svg class="ap-tabgroup-remove-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Tab;
