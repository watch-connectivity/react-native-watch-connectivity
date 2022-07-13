"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = void 0;
const native_module_1 = require("./native-module");
function sendMessage(message, replyCb, errCb) {
    native_module_1.NativeModule.sendMessage(message, replyCb ||
        ((reply) => {
            console.warn('Unhandled watch reply', reply);
        }), errCb ||
        ((err) => {
            console.warn('Unhandled sendMessage error', err);
        }));
}
exports.sendMessage = sendMessage;
