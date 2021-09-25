import { compressToURL, decompressFromURL } from '@amoutonbrady/lz-string'

const PATH_PREFIX = 'inmemory://model/src';
function serializeData(data: Record<string, string>): string {
    let serialized = {};
    for (const [key, value] of Object.entries(data)) {
        serialized[key.slice(PATH_PREFIX.length)] = value.trim();
    }
    return JSON.stringify(serialized).slice(1, -1);
}

function deserializeData(data: string): Record<string, string> {
    const tmp = JSON.parse(`{${data}}`);
    let result = {};
    for (const [key, value] of Object.entries(tmp)) {
        result[`${PATH_PREFIX}${key}`] = value;
    }
    return result;
}

export function b64Encode(data: Record<string, string>) {
    const value = compressToURL(serializeData(data));
    return value;
}

export function legacyB64Decode(str: string) {
    return decodeURIComponent(atob(str));
}

export function newB64Decode(str: string) {
    let tmp = decompressFromURL(str);
    if (!tmp) {
        return null;
    }
    return tmp;
}

export function b64Decode(str: string) {
    let value = newB64Decode(str);
    if (!value) {
        return JSON.parse(legacyB64Decode(str));
    }
    return deserializeData(value);
}
