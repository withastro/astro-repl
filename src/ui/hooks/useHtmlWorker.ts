import type { editor as Editor } from 'monaco-editor';
import type { RefObject } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';

const useHtmlWorker = (worker: Worker, input: string) => {
  const [html, setHtml] = useState('');
  const [span, setSpan] = useState(0);
  const trackedValue = useRef({ value: '', start: 0 });

  useEffect(() => {
    trackedValue.current = { value: input, start: performance.now() };
    worker.postMessage(JSON.stringify({ value: input }));
  }, [input]);

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
      let { content, input } = data.value;
      if (trackedValue.current.value === input) {
        setHtml(content)
        setSpan(data.timing.compile);
      }
    }
    worker.onmessage = handleMessage;
  }, []);

  return { html, duration: span };
};

export default useHtmlWorker;
