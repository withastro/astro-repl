import type { editor as Editor } from 'monaco-editor';
import type { RefObject } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

import { renderAstroToHTML } from '../../utils';

const useWorker = (worker: Worker, editorInstance: RefObject<Editor.IStandaloneCodeEditor>, deps: any[]) => {
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (!editorInstance.current) return;
    const editor = editorInstance.current;

    const model = editor.getModel();
    const value = model.getValue();
    if (value.trim()) {
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
        // fileSizeEl.textContent = `Error`;
        return;
      }

      let { content } = data.value;
      const output = await renderAstroToHTML(content);
      setHtml(output)
    }
    worker.onmessage = handleMessage;
  }, []);

  return html;
};

export default useWorker;
