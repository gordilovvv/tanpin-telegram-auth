// https://jasonformat.com/javascript-sleep/
export function sleep(milliseconds: number) {
    if (typeof Atomics === 'undefined') {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}