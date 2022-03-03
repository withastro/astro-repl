import type { editor } from 'monaco-editor';
import type { TabName } from '../const';
import { h, RefObject } from 'preact';
import { forwardRef } from 'preact/compat';
import Tabs from './Tabs';
import Tab from './Tab';
import { TABS } from '../const';
import useWindowSize from '../hooks/useWindowSize';

const noop = () => {};

export interface Props {
  currentModel?: editor.IModel;
  currentTab: TabName;
  models: editor.IModel[];
  onAddTab?: () => any;
  onRemoveTab?: (model: editor.IModel) => void;
  onSetTab?: (model: editor.IModel) => void;
  ref?: RefObject<HTMLElement>;
}

const Editor = forwardRef<HTMLElement, Props>(
  ({ models, currentModel, currentTab, onAddTab = noop, onRemoveTab = noop, onSetTab = noop, children, ...props }, editorRef) => {
    const { isDesktop } = useWindowSize();

    return (
      <div
        id="panel-code"
        role="tabpanel"
        class="ap-panel ap-panel__code ap-editor"
        aria-labelledby="tab-code"
        hidden={isDesktop ? false : currentTab !== TABS.CODE}
      >
        <Tabs onAddTab={() => onAddTab()}>
          {models.map((model, index) => (
            <Tab
              aria-selected={currentModel && currentModel.uri.toString() === model.uri.toString()}
              index={index}
              model={model}
              onRemoveTab={onRemoveTab}
              onSetTab={onSetTab}
            />
          ))}
        </Tabs>
        <main {...props} ref={editorRef} id="editor" class="ap-editor-code" />
      </div>
    );
  }
);

export default Editor;
