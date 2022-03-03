import type { Loader } from 'esbuild';

// Based on https://github.com/sindresorhus/path-is-absolute/blob/main/index.js
export const isAbsolute = (path: string) => {
    return path.length > 0 && path.charAt(0) === '/';
}

// Based on https://github.com/egoist/play-esbuild/blob/main/src/lib/path.ts
export const extname = (path: string) => {
    const m = /(\.[a-zA-Z0-9]+)$/.exec(path);
    return m ? m[1] : "";
}

// Based on https://github.com/egoist/play-esbuild/blob/main/src/lib/esbuild.ts
export const RESOLVE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".css", ".json"];
export const inferLoader = (url: string): Loader => {
    const ext = extname(url);
    if (RESOLVE_EXTENSIONS.includes(ext))
        return ext.slice(1) as Loader;

    if (ext === ".mjs" || ext === ".cjs") return "js";
    if (ext === ".mts" || ext === ".cts") return "ts";

    if (ext == ".scss") return "css";

    if (ext == ".png" || ext == ".jpeg" || ext == ".ttf") return "dataurl";
    if (ext == ".svg" || ext == ".html" || ext == ".txt") return "text";
    if (ext == ".wasm") return "file";

    return ext.length ? "text" : "ts";
}

// Based on https://github.com/okikio/bundle/blob/9489ee56dc508e493444d1e8c18aa044812bbd9e/src/ts/util/loader.ts
export const isBareImport = (url: string) => {
    return /^(?!\.).*/.test(url) && !isAbsolute(url);
}

export const HOST = 'https://cdn.skypack.dev/';
export const getCDNHost = (url: string) => {
    let argPath = url.replace(/^(skypack|esm|esm\.sh|unpkg|jsdelivr|esm\.run)\:/, "");
    let host = HOST;
    if (/^skypack\:/.test(url)) {
        host = `https://cdn.skypack.dev/`;
    } else if (/^(esm\.sh|esm)\:/.test(url)) {
        host = `https://cdn.esm.sh/`;
    } else if (/^unpkg\:/.test(url)) {
        host = `https://unpkg.com/`;
    } else if (/^(jsdelivr|esm\.run)\:/.test(url)) {
        host = `https://cdn.jsdelivr.net/npm/`;
    }

    // typescript will only work on esm.sh
    else if (/^typescript/.test(url)) {
        host = `https://unpkg.com/`;
    }

    return { argPath, host };
}

// Based on https://github.com/browserify/path-browserify/blob/master/index.js
export const dirname = (path: string) => {
    if (path.length === 0) return '.';
    let code = path.charCodeAt(0);
    let hasRoot = code === 47;
    let end = -1;
    let matchedSlash = true;
    for (let i = path.length - 1; i >= 1; --i) {
        code = path.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            // We saw the first non-path separator
            matchedSlash = false;
        }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
}

// Based on https://github.com/browserify/path-browserify/blob/master/index.js
export const normalizeStringPosix = (path: string, allowAboveRoot: boolean) => {
    let res = '';
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code: number;
    for (let i = 0; i <= path.length; ++i) {
        if (i < path.length)
            code = path.charCodeAt(i);
        else if (code === 47)
            break;
        else
            code = 47;
        if (code === 47) {
            if (lastSlash === i - 1 || dots === 1) {
                // NOOP
            } else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
                    if (res.length > 2) {
                        let lastSlashIndex = res.lastIndexOf('/');
                        if (lastSlashIndex !== res.length - 1) {
                            if (lastSlashIndex === -1) {
                                res = '';
                                lastSegmentLength = 0;
                            } else {
                                res = res.slice(0, lastSlashIndex);
                                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
                            }
                            lastSlash = i;
                            dots = 0;
                            continue;
                        }
                    } else if (res.length === 2 || res.length === 1) {
                        res = '';
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0)
                        res += '/..';
                    else
                        res = '..';
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0)
                    res += '/' + path.slice(lastSlash + 1, i);
                else
                    res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === 46 /*.*/ && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}

// Based on https://github.com/browserify/path-browserify/blob/master/index.js
export const resolve = (...args: string[]) => {
    let resolvedPath = '';
    let resolvedAbsolute = false;
    let cwd: string;

    for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        let path: string;
        if (i >= 0)
            path = args[i];
        else {
            if (cwd === undefined)
                cwd = '/';
            path = cwd;
        }

        // Skip empty entries
        if (path.length === 0) {
            continue;
        }

        resolvedPath = path + '/' + resolvedPath;
        resolvedAbsolute = path.charCodeAt(0) === 47;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
        if (resolvedPath.length > 0)
            return '/' + resolvedPath;
        else
            return '/';
    } else if (resolvedPath.length > 0) {
        return resolvedPath;
    } else {
        return '.';
    }
}

// Based on https://github.com/browserify/path-browserify/blob/master/index.js
export const basename = (path: string, ext?: string) => {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');

    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i: number;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path) return '';
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for (i = path.length - 1; i >= 0; --i) {
            let code = path.charCodeAt(i);
            if (code === 47) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    // We saw the first non-path separator, remember this index in case
                    // we need it if the extension ends up not matching
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    // Try to match the explicit extension
                    if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            // We matched the extension, so mark this as the end of our path
                            // component
                            end = i;
                        }
                    } else {
                        // Extension does not match, so our result is the entire path
                        // component
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }

        if (start === end) end = firstNonSlashEnd; else if (end === -1) end = path.length;
        return path.slice(start, end);
    } else {
        for (i = path.length - 1; i >= 0; --i) {
            if (path.charCodeAt(i) === 47) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // path component
                matchedSlash = false;
                end = i + 1;
            }
        }

        if (end === -1) return '';
        return path.slice(start, end);
    }
}