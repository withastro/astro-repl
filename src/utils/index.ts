export * from './astro';

import { b64EncodeUnicode } from "./b64";

// https://stackoverflow.com/questions/62954570/javascript-feature-detect-module-support-for-web-workers
export const ModuleWorkerTest = () => {
  let support = false;
  const test = {
    get type() {
      support = true;
      return "module";
    }
  }

  try {
    // We use "blob://" as url to avoid an useless network request.
    // This will either throw in Chrome
    // either fire an error event in Firefox
    // which is perfect since
    // we don't need the worker to actually start,
    // checking for the type of the script is done before trying to load it.
    // @ts-ignore
    // data:application/javascript;base64,${Buffer.from("export {};").toString('base64')}
    // const worker = new Worker(`blob://`, test); 
    // .toString('base64')
    const worker = new Worker(`data:application/javascript;base64,${b64EncodeUnicode("export {};")}`, test);
    worker.terminate();
    return support;
  } catch (e) {
    console.log(e)
  }

  return false;
};

export let ModuleWorkerSupported = ModuleWorkerTest();

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