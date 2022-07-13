"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReachability = void 0;
const native_module_1 = require("./native-module");
function getReachability() {
    return native_module_1.NativeModule.getReachability();
}
exports.getReachability = getReachability;
