import type { FunctionalComponent } from 'preact';
import { h, Fragment } from 'preact';
import { useRef, useCallback } from 'preact/hooks';

import { Uri } from 'monaco-editor';

import Editor from './Editor';
import Preview from './Preview';
import StatusBar from './StatusBar';
import useMonaco from '../hooks/useMonaco';
import useEsbuildWorker from '../hooks/useEsbuildWorker';
import useAstroWorker from '../hooks/useAstroWorker';

export interface Props {
  Monaco: typeof import('../../editor/modules/monaco')
  esbuildWorker: Worker
  astroWorker: Worker
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const App: FunctionalComponent<Props> = ({ Monaco, esbuildWorker, astroWorker }) => {
  const editorRef = useRef<HTMLElement|null>(null);
  const { editor, models, currentModel, value, setTab, addTab, removeTab } = useMonaco(Monaco, editorRef);
  const { html, error } = useEsbuildWorker(esbuildWorker, editor, [value]);
  const { js, duration } = useAstroWorker(astroWorker, editor, [value]);

  const onAddTab = useCallback(() => {
    const basenames = models.map(model => model.uri.path.split('/').pop().slice(0, '.astro'.length * -1)).filter(c => c.startsWith('Component'));
    let filename = 'Component';
    for (const basename of basenames) {
      if (basename === filename) {
        if (filename === 'Component') {
          filename = 'Component1';
        } else {
          const number = Number.parseInt(filename.replace(/^Component/, '')) + 1;
          filename = `Component${number}`
        }
      }
    }
    addTab(`---
const name = "Component"
---

<h1>Hello {name}</h1>`, 'astro', Uri.parse(`inmemory://model/src/components/${filename}.astro`))
  }, [models])

  const onSetTab = (model) => {
    setTab(model);
  }

  return (
    <>
      <Editor ref={editorRef} models={models} currentModel={currentModel} onAddTab={onAddTab} onSetTab={onSetTab} onRemoveTab={removeTab}  />
      <Preview hasError={!!error} html={html} js={js} />
      <StatusBar error={error} duration={duration}/>
    </>
  );
};

export default App;
