import type { editor as Editor } from "monaco-editor";
import type { RefObject } from 'preact';

import { useState, useEffect, useRef } from 'preact/hooks';

const useMonaco = (Monaco: typeof import('../../editor/modules/monaco'), editorRef: RefObject<HTMLElement|null>) => {
  const editorInstance = useRef<Editor.IStandaloneCodeEditor>();
  const [model, setModel] = useState('');

  useEffect(() => {
    if (editorRef && !editorInstance.current) {
      editorInstance.current = Monaco.build(editorRef.current);
      setModel(editorInstance.current.getModel().getValue().trim())
    }
  }, [])

  useEffect(() => {
    if (!editorInstance.current) {
      return;
    }
    const editor = editorInstance.current;
    const onDidChangeModelContent = editor.onDidChangeModelContent(
      () => {
        const editorModel = editor.getModel();
        setModel(editorModel.getValue().trim());
      }
    );
    return () => {
      onDidChangeModelContent.dispose()
    }
  }, [editorInstance])

  return { editor: editorInstance, model };
};

export default useMonaco;
