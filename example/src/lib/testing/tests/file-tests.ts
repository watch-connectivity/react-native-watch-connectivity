import {IntegrationTest} from '../IntegrationTest';
import {TestLogFn} from './util';

import fs from 'react-native-fs';
import {
  getFileTransfers,
  startFileTransfer,
  subscribeToFileTransfers,
  NativeWatchEvent
} from 'react-native-watch-connectivity';

export class FileIntegrationTest extends IntegrationTest {
  constructor() {
    super('Files');
    this.registerTest('Send file', 'reachable', this.testSendFile);
    this.registerTest(
      'Get file transfers',
      'reachable',
      this.testGetFileTransfers,
    );
  }

  testSendFile = (log: TestLogFn) => {
    return new Promise((resolve, reject) => {
      let path = 'file://' + fs.MainBundlePath + '/Blah_Blah_Blah.jpg';

      log('transferring file: ' + path);

      let didReceiveStartEvent = false;
      let didReceiveFinalProgressEvent = false;
      let didReceiveSuccessEvent = false;

      const unsubscribeFromFileTransfers = subscribeToFileTransfers((event) => {
        log('transfer event: ' + JSON.stringify(event));
        if (event.type === NativeWatchEvent.EVENT_FILE_TRANSFER_STARTED) {
          didReceiveStartEvent = true;
        } else if (
          event.type === NativeWatchEvent.EVENT_FILE_TRANSFER_PROGRESS &&
          event.fractionCompleted === 1
        ) {
          didReceiveFinalProgressEvent = true;
        } else if (
          event.type === NativeWatchEvent.EVENT_FILE_TRANSFER_FINISHED
        ) {
          didReceiveSuccessEvent = true;
        }

        if (
          didReceiveStartEvent &&
          didReceiveFinalProgressEvent &&
          didReceiveSuccessEvent
        ) {
          resolve();
          unsubscribeFromFileTransfers();
        }
      });

      startFileTransfer(path).catch((err) => {
        unsubscribeFromFileTransfers();
        reject(err);
      });

      log('transferred file');
    });

    // TODO: Clean up susbcribes on test failure (need an after func)
  };

  testGetFileTransfers = async (log: TestLogFn) => {
    const fileTransfers = await getFileTransfers();
    log('File transfers received: ' + JSON.stringify(fileTransfers, null, 2));
  };
}
