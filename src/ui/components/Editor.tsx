import type { editor } from 'monaco-editor';
import { h, Fragment } from 'preact';
import { useEffect } from 'preact/hooks';
import { forwardRef } from 'preact/compat';
import Tabs from './Tabs';
import Tab from './Tab';

const noop = () => {};

export interface Props {
  index: number;
  models: editor.IModel[];
  currentModel?: editor.IModel;
  onAddTab?: () => any;
  onRemoveTab?: (model: editor.IModel) => void;
  onSetTab?: (model: editor.IModel) => void;
  [key: string]: any;
}

const Editor = forwardRef<HTMLElement, Props>(({ models, currentModel, onAddTab = noop, onRemoveTab = noop, onSetTab = noop, ...props }, editorRef) => {
  return (
    <div class="ap-editor-frame">
      <Tabs onAddTab={() => onAddTab()}>
        {models.map((model, index) => (
          <Tab aria-selected={currentModel && currentModel.uri.toString() === model.uri.toString()} index={index} model={model} onRemoveTab={onRemoveTab} onSetTab={onSetTab} />
        ))}
      </Tabs>
      <main {...props} ref={editorRef} id="editor" class="ap-editor" />
    </div>
  );
});

export default Editor;
