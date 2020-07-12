import {IntegrationTest} from '../IntegrationTest';

import {isEqual} from 'lodash';
import {assert} from './util';

import * as faker from 'faker';
import {
  getApplicationContext,
  sendMessage,
  updateApplicationContext,
  watchEvents,
} from 'react-native-watch-connectivity';
import {TestFnOpts} from './index';
import {UnsubscribeFn} from 'react-native-watch-connectivity/events';

export class ApplicationContextTests extends IntegrationTest {
  constructor() {
    super('Application Context');
    this.registerTest(
      'Send application context',
      'reachable',
      this.testApplicationContext,
    );
    this.registerTest(
      'Subscribe to application context',
      'reachable',
      this.testSubscribeToApplicationContext,
    );
  }

  testApplicationContext = async (opts: TestFnOpts) => {
    const {log} = opts;
    const sentApplicationContext = {x: faker.lorem.words(3)};
    await this.sendApplicationContextAndWaitForAck(
      sentApplicationContext,
      opts,
    );
    const applicationContext = await getApplicationContext();
    log('got application context: ' + JSON.stringify(applicationContext));

    assert(
      isEqual(applicationContext, sentApplicationContext),
      'application context must match',
    );
  };

  testSubscribeToApplicationContext = async ({log}: TestFnOpts) => {
    return new Promise((resolve, reject) => {
      const expectedApplicationContext = {
        a: faker.lorem.words(2),
      };

      watchEvents.once('application-context', (applicationContextFromEvent) => {
        log(
          'received application context from watch event: ' +
            JSON.stringify(applicationContextFromEvent),
        );
        assert(
          isEqual(applicationContextFromEvent, expectedApplicationContext),
        );
        getApplicationContext()
          .then((applicationContextFromGetter) => {
            log(
              'received application context from getApplicationContext: ' +
                JSON.stringify(applicationContextFromGetter),
            );
            assert(
              isEqual(applicationContextFromGetter, expectedApplicationContext),
            );
            resolve();
          })
          .catch(reject);
        resolve();
      });

      sendMessage({
        test: true,
        text: 'send me some application context',
        context: expectedApplicationContext,
      });
      log('requested application context from watch');
    });
  };

  private sendApplicationContextAndWaitForAck = (
    applicationContextToSend: Record<string, unknown>,
    {log, after}: TestFnOpts,
  ) => {
    let unsubscribe: UnsubscribeFn = () => {};

    after(() => unsubscribe());

    return new Promise((resolve, reject) => {
      unsubscribe = watchEvents.addListener('message', (payload) => {
        if (payload) {
          log('Received message: ' + JSON.stringify(payload));
        }
        if (payload?.text === 'application context received by the watch') {
          unsubscribe();
          const applicationContext = payload && payload['application-context'];
          if (typeof applicationContext === 'object') {
            resolve(applicationContext);
          } else {
            reject(new Error('Invalid payload'));
          }
        }
      });

      updateApplicationContext(applicationContextToSend);

      log(
        'sent application context: ' + JSON.stringify(applicationContextToSend),
      );
      log('waiting for acknowledgement from watch');
    });
  };
}
