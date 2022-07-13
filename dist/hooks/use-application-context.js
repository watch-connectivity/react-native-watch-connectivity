'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
exports.useApplicationContext = void 0;
const application_context_1 = require('../application-context');
const react_1 = require('react');
const events_1 = __importDefault(require('../events'));
function useApplicationContext() {
  const [applicationContext, setApplicationContext] = react_1.useState(null);
  react_1.useEffect(() => {
    application_context_1.getApplicationContext().then(setApplicationContext);
    return events_1.default.addListener(
      'application-context',
      setApplicationContext,
    );
  }, []);
  return applicationContext;
}
exports.useApplicationContext = useApplicationContext;
