import type { editor as Editor } from 'monaco-editor';
import type { RefObject } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

import { renderAstroToHTML } from '../../utils';

const useWorker = (worker: Worker, editorInstance: RefObject<Editor.IStandaloneCodeEditor>, deps: any[]) => {
  const trackedValue = useRef('');
  const [html, setHtml] = useState('');
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!editorInstance.current) return;
    const editor = editorInstance.current;

    const model = editor.getModel();
    const value = model.getValue();
    if (value.trim()) {
      trackedValue.current = value.trim();
      worker.postMessage(JSON.stringify({ filename: model.uri.path, value }));
    }
  }, deps);

  useEffect(() => {
    async function handleMessage({ data }: any) {
      if (data.warn) {
        console.warn(data.warn + ' \n');
        return;
      }

      if (data.ready) {
        // fileSizeEl.textContent = `...`;
        return;
      }

      if (data.error) {
        console.error(data.type + ' (please create a new issue in the repo)\n', data.error);
        if (typeof data.error === 'object' && data.error.message) {
          const message = data.error.message?.split('virtualfs:')[1]?.split(' ').slice(1).join(' ').split('\n')[0]?.replace('error', 'Error');
          setErr(message);
          return;
        }
        setErr(data.error);
        return;
      }

      if (data.value) {
        setErr(null);
        let { content, input } = data.value;
        if (trackedValue.current === input.trim()) {
          const output = await renderAstroToHTML(content);
          if (typeof output === 'string') {
            setHtml(output);
          } else {
            setErr(output.errors[0]);
          }
        }
      }
    }
    worker.onmessage = handleMessage;
  }, []);

  return { html, error: err };
};

export default useWorker;
