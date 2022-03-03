import type { FunctionalComponent } from 'preact';
import type { TabName } from '../const';
import { h, Fragment } from 'preact';
import { useRef, useCallback, useState, useEffect } from 'preact/hooks';
import { Uri, editor as MonacoEditor } from 'monaco-editor';

import Editor from './Editor';
import JS from './JS';
import HTML from './HTML';
import Menu from './Menu';
import Preview from './Preview';
import StatusBar from './StatusBar';
import Share from './Share';
import useMonaco from '../hooks/useMonaco';
import { TABS } from '../const';
import useWindowSize from '../hooks/useWindowSize';

import { BuildWorker, WorkerEvents } from '../../utils/WebWorker';
import { debounce, ModuleWorkerSupported } from '../../utils';

import { encode, decode } from "../../utils/encode-decode";

let initialized = false;
let ready = false;

const postMessage = (obj: any) => {
  let messageStr = JSON.stringify(obj);
  let encodedMessage = encode(messageStr);
  BuildWorker.postMessage(encodedMessage , [encodedMessage.buffer]); 
}

BuildWorker.addEventListener(
"message",
  ({ data }: MessageEvent<Uint8Array>) => {
    let { event, details } = JSON.parse(decode(data));
    WorkerEvents.emit(event, details);
  }
);

let warnFn, errFn, resultFn, buildFn, readyFn;
warnFn = errFn = resultFn = buildFn = readyFn = (details: any) => {};

WorkerEvents.on({
  init() {
    console.log("Initalized");
    initialized = true;

    if (initialized)
      WorkerEvents.emit("ready");
  },
  warn: (details: any) => warnFn(details),
  error: (details: any) => errFn(details),
  result: (details: any) => resultFn(details),
  build: (details: any) => buildFn(details),
  ready: (details: any) => readyFn(details),
});

let Models = [];
const difference = (a: any[], b: any[]) => {
  let seta = new Set(a);
  let setb = new Set(b);
  return [
    [...seta].filter(x => !setb.has(x)),  
    [...setb].filter(x => !seta.has(x))
  ].flat();
}

export interface Props {
  Monaco: typeof import('../../editor/modules/monaco');
  initialModels?: Record<string, string>
}

// Fix the ask to confirm error
function beforeUnloadListener(event) {
  event.preventDefault();
  return event.returnValue = 'Are you sure you want to exit? Your work will be lost!';
};

// A function that invokes a callback when the page has unsaved changes.
window.addEventListener('beforeunload', beforeUnloadListener);

const App: FunctionalComponent<Props> = ({ Monaco, initialModels = {} }) => {
  const editorRef = useRef<HTMLElement | null>(null);
  const { editor, models, currentModel, value, setTab, addTab, removeTab } = useMonaco(Monaco, editorRef, initialModels);

  const { isDesktop } = useWindowSize();
  const [currentTab, setCurrentTab] = useState<TabName>(isDesktop ? TABS.PREVIEW : TABS.CODE);
  const [loading, setLoading] = useState(true);

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
    setTab(model);
  };

  const trackedValue = useRef({ value: '', start: 0 });
  const [js, setJs] = useState('');
  const [html, setHtml] = useState('');
  const [formattedHtml, setformattedHtml] = useState('');

  const [err, setErr] = useState("");
  const [duration, setDuration] = useState(0);

  const getCurrent = () => {
    if (!editor.current) return { current: null };
    const _editor = editor.current;

    const model = _editor.getModel();
    const value = model.getValue().trim();
    if (value) {
      trackedValue.current = { value, start: performance.now() };
      return {
        current: { filename: model.uri.path, value }
      };
    }
  }

  let updateModels = () => {
    if (models.length > 0) {
      let _models = models.map(model => {
        const filename = model.uri.path;
        const value = model.getValue();
        return { filename, value };
      });

      postMessage({
        event: "build",
        details: Object.assign(
          {
            models: _models,
            ModuleWorkerSupported
          },
          getCurrent()
        )
      });

      Models = [..._models].map((x) => `${(x as any).filename}`);
    }
  };

  warnFn = (details) => {
    let { type, message } = details;
    console.warn(`${type}\n${message}`);
    // console.warn(message)

    if (typeof message == "string") {
      setErr(`${type}\n${message}`);
      setTimeout(() => {
        setErr(null);
      }, 1500);
    }
  };

  errFn = (details) => {
    let { type, error } = details;
    if (typeof error === 'object' && error.message) {
      const message = error.message.includes("virtualfs:") ?
        error.message?.split('virtualfs:')[1]?.split(' ').slice(1).join(' ').split('\n')[0]?.replace('error', 'Error') :
        error.message;

      console.error(
        `${type} (please create a new issue in the repo)\n`,
        new Error(message) 
      );
      setErr(JSON.stringify(message));
      return;
    } else if (Array.isArray(error) || Array.isArray(error?.errors)) {
      let errArr = "errors" in error ? error.errors : error;
      errArr.forEach((err: string) => { 
        console.error(err);
      });

      if (errArr.length > 0)
        setErr(errArr[0].pluginName + ":" + errArr[0].text);

      return;
    } 

    console.error(
      `${type} (please create a new issue in the repo)\n`,
      JSON.stringify(error)
    );
    setErr(JSON.stringify(error));
  };

  resultFn = (details) => {
    setErr(null);
    setLoading(false);
    if (details.html) setHtml(details.html?.content);
    if (details.js) {
      setJs(details.js?.content);
      if (details.js?.timing) setDuration(details.js.timing?.compile);
    }

    if (details.shiki) setformattedHtml(details.shiki?.content);
  };

  buildFn = debounce(() => {
    let { current } = getCurrent() ?? {};
    if (current == null) return;
    postMessage({
      event: "build",
      details: { current, ModuleWorkerSupported }
    });
  }, 30);

  readyFn = () => {
    console.log("Ready");
    updateModels();
    ready = true;
  };

  useEffect(() => {
    if (!initialized || !ready) return;
    
    let diff = difference(
      models.map(model => {
        const filename = model.uri.path;
        return `${filename}`;
      }), 
      Models
    );

    postMessage({
      event: "delete",
      details: {
        filenames: diff
      }
    });

    updateModels();
  }, [models])

  useEffect(() => { 
    if (!initialized) return;
    WorkerEvents.emit("build");
  }, [value]);

  return (
    <>
      <Menu currentTab={currentTab} setCurrentTab={setCurrentTab}>
        <Share models={models} />
      </Menu>
      <Editor
        currentModel={currentModel}
        currentTab={currentTab}
        models={models}
        onAddTab={onAddTab}
        onRemoveTab={removeTab}
        onSetTab={onSetTab}
        ref={editorRef}
      />
      <Preview currentTab={currentTab} hasError={!!err} html={html} loading={loading} />
      <HTML currentTab={currentTab} hasError={!!err} html={formattedHtml} />
      <JS currentTab={currentTab} hasError={!!err} code={js} />
      <StatusBar error={err} duration={duration} />
    </>
  );
};

export default App;
