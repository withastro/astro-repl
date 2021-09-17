export function b64Encode(data: Record<string, string>) {
    return btoa(encodeURIComponent(JSON.stringify(data)).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(('0x' + p1) as any);
    }));
}

export function b64Decode(str: string) {
    return JSON.parse(decodeURIComponent(atob(str)));
}
