import type { FunctionalComponent } from 'preact';
import { h } from 'preact';
import ms from 'ms';

export interface Props {
  duration: number
  error?: Error;
}

const StatusBar: FunctionalComponent<Props> = ({ error, duration = 0 }) => {
  if (error) {
    const [reason, ...messages] = error.toString().split(':');
    const message = messages.join(':');
    return (
      <aside class="ap-statusbar ap-statusbar-error">
        <span id="status" class="ap-statusbar-status">
          {reason.trim()}
        </span>
        <span id="last-task-time" class="ap-statusbar-time">
          {message.trim()}
        </span>
      </aside>
    );
  }
  duration = Math.floor(duration);
  return (
    <aside class="ap-statusbar">
      <span id="status" class="ap-statusbar-status">
        Compiled in
      </span>
      <span id="last-task-time" class="ap-statusbar-time">
        {ms(duration)}
      </span>
    </aside>
  );
};

export default StatusBar;
