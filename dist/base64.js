"use strict";
/* eslint-disable no-bitwise */
Object.defineProperty(exports, "__esModule", { value: true });
exports.atob = exports.btoa = void 0;
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
function btoa(input = '') {
    let str = input;
    let output = '';
    // noinspection CommaExpressionJS
    for (let block = 0, charCode, i = 0, map = chars; str.charAt(i | 0) || ((map = '='), i % 1); output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))) {
        charCode = str.charCodeAt((i += 3 / 4));
        if (charCode > 0xff) {
            throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        }
        block = (block << 8) | charCode;
    }
    return output;
}
exports.btoa = btoa;
function atob(input = '') {
    let str = input.replace(/[=]+$/, '');
    let output = '';
    if (str.length % 4 === 1) {
        throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    // noinspection CommaExpressionJS
    for (let bc = 0, bs = 0, buffer, i = 0; (buffer = str.charAt(i++)); ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0) {
        buffer = chars.indexOf(buffer);
    }
    return output;
}
exports.atob = atob;
