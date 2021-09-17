import type { FunctionalComponent } from 'preact';
import { h } from 'preact';
import ms from 'ms';
import pkg from '../../../package.json';

export interface Props {
  duration: number;
  error?: Error;
}

const StatusBar: FunctionalComponent<Props> = ({ error, children, duration = 0 }) => {
  const compilerVersion = pkg.dependencies['@astrojs/compiler'].slice(1);
  const Version = () => (
    <div>
      <a href="https://github.com/snowpackjs/astro-compiler-next">
        <span class="ap-statusbar-status">@astrojs/compiler</span>
      </a>
      <span class="ap-statusbar-time">{compilerVersion}</span>
    </div>
  );
  if (error) {
    const [reason, ...messages] = error.toString().split(':');
    const message = messages.join(':');
    return (
      <aside class="ap-statusbar has-error">
        <div>
          <span id="status" class="ap-statusbar-status">
            {reason.trim()}
          </span>
          <span id="last-task-time" class="ap-statusbar-time">
            {message.trim()}
          </span>
        </div>
        {children}
        <Version />
      </aside>
    );
  }
  duration = Math.floor(duration);
  return (
    <aside class="ap-statusbar">
      <div>
        <span id="status" class="ap-statusbar-status">
          Compiled in
        </span>
        <span id="last-task-time" class="ap-statusbar-time">
          {ms(duration)}
        </span>
      </div>
      <Version />
    </aside>
  );
};

export default StatusBar;
