"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageData = void 0;
const encoding_1 = require("./encoding");
const native_module_1 = require("./native-module");
const base64_1 = require("./base64");
function sendMessageData(data, encoding = encoding_1.Encoding.NSUTF8StringEncoding) {
    return new Promise((resolve, reject) => {
        native_module_1.NativeModule.sendMessageData(data, encoding, (resp) => {
            const decoded = base64_1.atob(resp);
            resolve(decoded);
        }, (err) => {
            reject(err);
        });
    });
}
exports.sendMessageData = sendMessageData;
