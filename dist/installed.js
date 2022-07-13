"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIsWatchAppInstalled = void 0;
const native_module_1 = require("./native-module");
function getIsWatchAppInstalled() {
    return native_module_1.NativeModule.getIsWatchAppInstalled();
}
exports.getIsWatchAppInstalled = getIsWatchAppInstalled;
