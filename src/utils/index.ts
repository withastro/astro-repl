export * from './astro';

import { b64EncodeUnicode } from "./b64";

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


//  export const debounce = (func, delay = 300) => {
//   let inDebounce;
//   return function(...args) {
//     const context = this;
//     clearTimeout(inDebounce)
//     inDebounce = setTimeout(() => func.apply(context, args), delay)
//   }
// }

/**
 * throttle function that catches and triggers last invocation
 * use time to see if there is a last invocation
 */
export const throttle = (func: Function, limit = 300) => {
  let lastFunc: any;
  let lastRan: any;
  return function (...args: any) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};