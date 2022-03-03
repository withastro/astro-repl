import type { editor as Editor } from 'monaco-editor';
// import path from 'path';
import { basename as pathBasename} from '../../utils/loader';
import type { RefObject } from 'preact';
import { editor, Range, Position, Uri } from 'monaco-editor';
const { createModel } = editor;

import { useState, useEffect, useRef, useCallback } from 'preact/hooks';

const useMonaco = (Monaco: typeof import('../../editor/modules/monaco'), editorRef: RefObject<HTMLElement | null>, initialModels: Record<string, string>) => {
  const editorInstance = useRef<Editor.IStandaloneCodeEditor>();
  const [value, setValue] = useState(null);
  const viewStates = useRef<Record<string, Editor.ICodeEditorViewState>>({});
  const [models, setModels] = useState<Editor.ITextModel[]>([]);
  const previousModels = useRef<Editor.ITextModel[]>(null);
  const [currentModel, setCurrentModel] = useState<Editor.ITextModel>();

  const setTab = useCallback(
    (model: Editor.ITextModel) => {
      if (!editorInstance.current) {
        return;
      }
      if (currentModel && currentModel.uri.toString() === model.uri.toString()) {
        return;
      }
      const editor = editorInstance.current;

      const saveViewState = () => {
        const model = editor.getModel();
        if (model) {
          previousModels.current.push(model);
          const viewState = editor.saveViewState();
          viewStates.current[model.uri.toString()] = viewState;
        }
      };

      const restoreViewState = () => {
        const viewState = viewStates.current[model.uri.toString()];
        if (viewState) {
          editor.restoreViewState(viewState);
        }
      };

      saveViewState();
      editor.setModel(model);
      setValue(model.getValue().trim());
      setCurrentModel(model);
      setTimeout(() => {
        restoreViewState();
      }, 20);
    },
    [currentModel]
  );

  const addTab: typeof createModel = (...args) => {
    if (!editorInstance.current) {
      return;
    }
    const model = createModel(...args);
    const basename = pathBasename(args[2].path, '.astro');
    setModels((models) => {
      return [...models, model];
    });
    const openFrontmatter = models[0].findNextMatch('---\n', new Position(0, 0), false, false, ' \t\n', true);
    const end = openFrontmatter.range.getEndPosition();
    models[0].applyEdits([
      {
        range: new Range(end.lineNumber, end.column, end.lineNumber, end.column),
        text: `import ${basename} from '@/${basename}.astro';\n`,
      },
    ]);
    setTab(model);
    return model;
  };

  const removeTab = useCallback(
    (model: Editor.IModel) => {
      if (!editorInstance.current) {
        return;
      }
      const { uri } = model;
      model.dispose();
      previousModels.current = previousModels.current.filter((m) => m.uri.toString() !== uri.toString());
      delete viewStates[uri.toString()];
      setModels((models) => models.filter((model) => model.uri.toString() !== uri.toString()));
      if (currentModel.uri.toString() === model.uri.toString()) {
        previousModels.current.pop();
        setTab(previousModels.current[previousModels.current.length - 1]);
      }
    },
    [currentModel, setTab]
  );

  useEffect(() => {
    if (editorRef && !editorInstance.current && initialModels) {
      const { editor, models } = Monaco.build(editorRef.current, initialModels);
      editorInstance.current = editor;
      previousModels.current = [...models];
      setModels([...models]);
      setCurrentModel(models[0]);
      setTab(models[0]);
    }
  }, []);

  useEffect(() => {
    if (!editorInstance.current) {
      return;
    }
    const editor = editorInstance.current;
    const onDidChangeModelContent = editor.onDidChangeModelContent(() => {
      setValue(editor.getModel().getValue().trim());
    });
    return () => {
      onDidChangeModelContent.dispose();
    };
  }, [editorInstance]);

  return { editor: editorInstance, value, models, currentModel, addTab, removeTab, setTab };
};

export default useMonaco;
