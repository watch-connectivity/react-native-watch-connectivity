"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._getMissedFile = exports.getFileTransfers = exports._transformFilePayload = exports.startFileTransfer = void 0;
const lodash_sortby_1 = __importDefault(require("lodash.sortby"));
const native_module_1 = require("./native-module");
function startFileTransfer(uri, metadata = {}) {
    return native_module_1.NativeModule.transferFile(uri, metadata);
}
exports.startFileTransfer = startFileTransfer;
/**
 * @private
 */
function _transformFilePayload({ startTime, endTime, ...rest }) {
    return {
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        ...rest,
    };
}
exports._transformFilePayload = _transformFilePayload;
async function getFileTransfers() {
    const adapted = {};
    const transfers = await native_module_1.NativeModule.getFileTransfers();
    Object.values(transfers).forEach((t) => {
        adapted[t.id] = _transformFilePayload(t);
    });
    return adapted;
}
exports.getFileTransfers = getFileTransfers;
function processFileQueue(queue) {
    const fileArr = lodash_sortby_1.default(Object.entries(queue).map(([id, file]) => ({
        id,
        url: file.url,
        metadata: file.metadata,
        timestamp: parseInt(id, 10),
    })), (u) => u.timestamp);
    return fileArr;
}
/**
 * @private
 */
async function _getMissedFile() {
    const fileCache = await native_module_1.NativeModule.getQueuedFiles();
    const items = processFileQueue(fileCache);
    return items;
}
exports._getMissedFile = _getMissedFile;
