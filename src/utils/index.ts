export * from './astro';

/**
 * debounce function
 * use timer to maintain internal reference of timeout to clear
 */
 export const debounce = (func: Function, timeout = 300) => {
  let timer: any;
  return function (...args: any) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};
