import type { editor as Editor } from 'monaco-editor';
import type { FunctionalComponent } from 'preact';
import { h, Fragment } from 'preact';
import path from 'path';

const noop = () => {};

export interface Props {
  index: number;
  model: Editor.IModel;
  "aria-selected"?: boolean;
  onRemoveTab?: (model: Editor.IModel) => void;
  onSetTab?: (model: Editor.IModel) => void;
}
const Tab: FunctionalComponent<Props> = ({ "aria-selected": active = false, index, onRemoveTab = noop, onSetTab = noop, model }) => {
    return (
        <li class={`ap-preview-tabwrapper ${index !== 0 ? 'ap-tab-can-remove' : ''}`.trim()}>
            <button
              role="tab"
              type="button"
              aria-selected={active}
              class="ap-preview-tab"
              onClick={() => onSetTab(model)}
            >
              {path.posix.basename(model.uri.path)}
            </button>
            {index !== 0 && (
              <button
                type="button"
                class="ap-tab-remove"
                onClick={() => onRemoveTab(model)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
        </li>
    )
}

export default Tab;
