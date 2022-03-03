import type { FunctionalComponent } from 'preact';
import type { editor as Editor } from 'monaco-editor';
import { h } from 'preact';
import { useState } from 'preact/hooks';
import copy from 'copy-text-to-clipboard';

import { b64Encode } from '../../utils/b64';

export interface Props {
  models: Editor.IModel[];
}

let timeout: number;

const Share: FunctionalComponent<Props> = ({ models }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleClick = () => {
    const data = {};
    for (const model of models) {
      const uri = model.uri.toString();
      const value = model.getValue();
      data[uri] = value;
    }
    const str = b64Encode(data);
    window.location.hash = str; // update hash
    copy(window.location.href); // copy to clipboard

    setTooltipVisible(true);
    clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      setTooltipVisible(false);
    }, 1000);
  };

  return (
    <div class="ap-tabgroup-tabwrapper ap-tabgroup-tabwrapper--share ap-tooltip-wrapper" data-tooltip={tooltipVisible}>
      <button class="ap-tabgroup-tab" id="tab-js" id="share" onClick={handleClick}>
        Share
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
      </button>

      <div class="ap-tooltip">Copied!</div>
    </div>
  );
};

export default Share;
