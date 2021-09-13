import type { editor as Editor } from "monaco-editor";

import { h, render } from 'preact';
import App, { Props as AppProps } from './components/App.tsx';

const hydrate = (props: AppProps) => {
    const app = document.querySelector('#app');
    render(h(App, props), app);
}

export default hydrate;
