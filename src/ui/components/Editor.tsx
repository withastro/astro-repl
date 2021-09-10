import { h } from 'preact';
import { forwardRef } from 'preact/compat';

const Editor = forwardRef((props, editorRef) => {
    return <main {...props} ref={editorRef} id="editor" class="ap-editor" />
})

export default Editor;
