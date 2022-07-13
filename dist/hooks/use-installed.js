'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
exports.useInstalled = void 0;
const react_1 = require('react');
const events_1 = __importDefault(require('../events'));
const installed_1 = require('../installed');
function useInstalled() {
  const [installed, setInstalled] = react_1.useState(false);
  react_1.useEffect(() => {
    installed_1.getIsWatchAppInstalled().then(setInstalled);
    return events_1.default.addListener('installed', setInstalled);
  }, []);
  return installed;
}
exports.useInstalled = useInstalled;
