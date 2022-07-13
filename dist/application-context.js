"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicationContext = exports.updateApplicationContext = void 0;
const native_module_1 = require("./native-module");
function updateApplicationContext(context) {
    native_module_1.NativeModule.updateApplicationContext(context);
}
exports.updateApplicationContext = updateApplicationContext;
function getApplicationContext() {
    return native_module_1.NativeModule.getApplicationContext();
}
exports.getApplicationContext = getApplicationContext;
