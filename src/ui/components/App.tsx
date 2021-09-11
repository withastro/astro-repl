import type { FunctionalComponent } from 'preact';
import { h, Fragment } from 'preact';
import { useRef } from 'preact/hooks';

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

const App: FunctionalComponent<Props> = ({ Monaco, esbuildWorker, astroWorker }) => {
  const editorRef = useRef<HTMLElement|null>(null);
  const { editor, model } = useMonaco(Monaco, editorRef);
  const { html, error } = useEsbuildWorker(esbuildWorker, editor, [model]);
  const { js, duration } = useAstroWorker(astroWorker, editor, [model]);

  return (
    <>
      <Editor ref={editorRef} />
      <Preview hasError={!!error} html={html} js={js} />
      <StatusBar error={error} duration={duration}/>
    </>
  );
};

export default App;
