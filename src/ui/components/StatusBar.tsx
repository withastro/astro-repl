import { h } from 'preact';

const StatusBar = () => {
  return (
    <aside class="ap-statusbar">
      <span id="status" class="ap-statusbar-status">
        Done
      </span>
      <span id="last-task-time" class="ap-statusbar-time">
        3ms
      </span>
    </aside>
  );
};

export default StatusBar;
