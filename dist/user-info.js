"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getMissedUserInfo = exports.transferUserInfo = exports.transferCurrentComplicationUserInfo = void 0;
const native_module_1 = require("./native-module");
const lodash_sortby_1 = __importDefault(require("lodash.sortby"));
function transferCurrentComplicationUserInfo(info) {
    native_module_1.NativeModule.transferCurrentComplicationUserInfo(info);
}
exports.transferCurrentComplicationUserInfo = transferCurrentComplicationUserInfo;
function transferUserInfo(info) {
    native_module_1.NativeModule.transferUserInfo(info);
}
exports.transferUserInfo = transferUserInfo;
function processUserInfoQueue(queue) {
    const userInfoArr = lodash_sortby_1.default(Object.entries(queue).map(([id, userInfo]) => ({
        id,
        userInfo,
        timestamp: parseInt(id, 10),
    })), (u) => u.timestamp);
    return userInfoArr;
}
/**
 * @private
 */
async function _getMissedUserInfo() {
    const userInfoCache = await native_module_1.NativeModule.getQueuedUserInfo();
    const items = processUserInfoQueue(userInfoCache);
    return items.map((q) => q.userInfo);
}
exports._getMissedUserInfo = _getMissedUserInfo;
