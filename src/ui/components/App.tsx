import type { FunctionalComponent } from 'preact';
import type { TabName } from '../const';
import { h, Fragment } from 'preact';
import { useRef, useCallback, useState, useEffect } from 'preact/hooks';
import { Uri } from 'monaco-editor';

import Editor from './Editor';
import JS from './JS';
import Menu from './Menu';
import Preview from './Preview';
import StatusBar from './StatusBar';
import useMonaco from '../hooks/useMonaco';
import useEsbuildWorker from '../hooks/useEsbuildWorker';
import useAstroWorker from '../hooks/useAstroWorker';
import { TABS } from '../const';
import useWindowSize from '../hooks/useWindowSize';

export interface Props {
  Monaco: typeof import('../../editor/modules/monaco');
  esbuildWorker: Worker;
  astroWorker: Worker;
}

let resizeTimeout: number | undefined;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const App: FunctionalComponent<Props> = ({ Monaco, esbuildWorker, astroWorker }) => {
  const editorRef = useRef<HTMLElement | null>(null);
  const { editor, models, currentModel, value, setTab, addTab, removeTab } = useMonaco(Monaco, editorRef);
  const { html, error } = useEsbuildWorker(esbuildWorker, editor, [value]);
  const { js, duration } = useAstroWorker(astroWorker, editor, [value]);
  const { isDesktop } = useWindowSize();
  const [currentTab, setCurrentTab] = useState<TabName>(isDesktop ? TABS.PREVIEW : TABS.CODE);

  const onAddTab = useCallback(() => {
    const basenames = models
      .map((model) =>
        model.uri.path
          .split('/')
          .pop()
          .slice(0, '.astro'.length * -1)
      )
      .filter((c) => c.startsWith('Component'));
    let filename = 'Component';
    for (const basename of basenames) {
      if (basename === filename) {
        if (filename === 'Component') {
          filename = 'Component1';
        } else {
          const number = Number.parseInt(filename.replace(/^Component/, '')) + 1;
          filename = `Component${number}`;
        }
      }
    }
    addTab(
      `---
const name = "Component"
---

<h1>Hello {name}</h1>`,
      'astro',
      Uri.parse(`inmemory://model/src/components/${filename}.astro`)
    );
  }, [models]);

  const onSetTab = (model) => {
    console.log(model.uri.toString());
    setTab(model);
  };

  // confirm exit before navigating
  useEffect(() => {
    window.onbeforeunload = () => confirm(`Exit Astro Play? Your work will be lost!`);
  }, []);

  return (
    <>
      <Menu currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <Editor
        currentModel={currentModel}
        currentTab={currentTab}
        models={models}
        onAddTab={onAddTab}
        onRemoveTab={removeTab}
        onSetTab={onSetTab}
        ref={editorRef}
      />
      <Preview currentTab={currentTab} hasError={!!error} html={html} />
      <JS currentTab={currentTab} hasError={!!error} code={js} />
      <StatusBar error={error} duration={duration} />
    </>
  );
};

export default App;
