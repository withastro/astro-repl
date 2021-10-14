import './styles/index.css';
import { b64Decode } from './utils/b64';
import render from './ui';

(async () => {
  // Monaco Code Editor
  let Monaco = await import('./editor/modules/monaco');
  const hash = window.location.hash;
  let initialModels = {};
  if (hash) {
    try {
      initialModels = b64Decode(hash.slice(1));
    } catch (err) {
      console.error(`Could not load share URL`);
    }
  }
  render({ Monaco, initialModels });
})();