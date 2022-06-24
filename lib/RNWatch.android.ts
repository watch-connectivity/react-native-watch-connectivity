/**
 * Stub of RNWatch for Android.
 *
 * @providesModule RNWatch
 */
'use strict';

const warning = require('fbjs/lib/warning');

const RNWatch = {
  test: function () {
    warning('Not supported on Android.');
  },
  useInstalled: false,
  usePaired: false,
  useReachability: false,
  useApplicationContext: false,
};

export default RNWatch;
