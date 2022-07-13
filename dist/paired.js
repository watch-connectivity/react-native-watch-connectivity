"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIsPaired = void 0;
const native_module_1 = require("./native-module");
function getIsPaired() {
    return native_module_1.NativeModule.getIsPaired();
}
exports.getIsPaired = getIsPaired;
