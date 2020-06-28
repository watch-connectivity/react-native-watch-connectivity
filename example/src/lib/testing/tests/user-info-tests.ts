import {IntegrationTest} from '../IntegrationTest';

import {isEqual} from 'lodash';
import {assert, TestLogFn} from './util';
import * as faker from 'faker';
import {
  getMissedUserInfo,
  sendMessage,
  transferCurrentComplicationUserInfo,
  transferUserInfo,
  watchEvents,
  WatchPayload,
} from 'react-native-watch-connectivity';
import {NativeModule} from 'react-native-watch-connectivity/native-module';

export function _clearUserInfoQueue<
  UserInfo extends WatchPayload = WatchPayload
>(): Promise<void> {
  return NativeModule.clearUserInfoQueue();
}

export class UserInfoIntegrationTest extends IntegrationTest {
  constructor() {
    super('User Info');
    this.registerTest('Transfer user info', 'reachable', this.testSendUserInfo);
    this.registerTest(
      'Transfer complication user info',
      'reachable',
      this.testTransferComplicationUserInfo,
    );
    this.registerTest(
      'Subscribe to user info',
      'reachable',
      this.testSubscribeToUserInfo,
    );
    this.registerTest('User info queue', 'reachable', this.testUserInfoQueue);
  }

  testSendUserInfo = async (log: TestLogFn) => {
    await _clearUserInfoQueue();
    const sentUserInfo = {uid: faker.lorem.word(), name: faker.lorem.words(2)};
    const receivedUserInfo = await this.sendUserInfoAndWaitForAck(
      sentUserInfo,
      log,
    );
    assert(isEqual(sentUserInfo, receivedUserInfo));
  };

  testTransferComplicationUserInfo = async (log: TestLogFn) => {
    await _clearUserInfoQueue();
    const sentUserInfo = {uid: faker.lorem.word(), name: faker.lorem.words(2)};
    const receivedUserInfo = await this.sendUserInfoAndWaitForAck(
      sentUserInfo,
      log,
      true,
    );
    assert(isEqual(sentUserInfo, receivedUserInfo));
  };

  testSubscribeToUserInfo = async (log: TestLogFn) => {
    return _clearUserInfoQueue().then(
      () =>
        new Promise((resolve, reject) => {
          const expectedUserInfo = {
            uid: 'xyz',
            name: 'bob',
            email: 'bob@example.com',
          };

          watchEvents.once('user-info', (e) => {
            log('received user info from watch event: ' + JSON.stringify(e));
            if (!isEqual(e, expectedUserInfo)) {
              reject(new Error('User info did not match'));
            }

            getMissedUserInfo()
              .then((missed) => {
                log(`${missed.length} missed user info`);
                assert(!missed.length, 'should have dequeued user info');
                resolve();
              })
              .catch(reject);
          });

          sendMessage({test: true, text: 'send me some user info'});
          log('requested user info from watch');
        }),
    );
  };

  testUserInfoQueue = async (log: TestLogFn) => {
    return _clearUserInfoQueue().then(async () => {
      let message = {test: true, text: 'send me some user info'};
      log('sent message: ' + JSON.stringify(message));

      await new Promise((resolve) => {
        sendMessage(message, () => {
          resolve();
        });
      });

      message = {test: true, text: 'send me some more user info'};
      log('sent message: ' + JSON.stringify(message));
      await new Promise((resolve) => {
        sendMessage(message, () => {
          resolve();
        });
      });

      let missedUserInfo = await getMissedUserInfo();

      log('user info: ' + JSON.stringify(missedUserInfo));

      const firstExpectedUserInfo = {
        uid: 'xyz',
        name: 'bob',
        email: 'bob@example.com',
      };

      const secondExpectedUserInfo = {
        uid: 'abc',
        name: 'mike',
        email: 'mike@example.com',
      };

      assert(
        missedUserInfo.length === 2,
        'should have two queued user records',
      );

      assert(
        isEqual(firstExpectedUserInfo, missedUserInfo[0]),
        'first record should match',
      );

      assert(
        isEqual(secondExpectedUserInfo, missedUserInfo[1]),
        'second record should match',
      );

      missedUserInfo = await getMissedUserInfo();

      assert(
        missedUserInfo.length === 0,
        'grabbing the missed user info should dequeue it',
      );
    });
  };

  private sendUserInfoAndWaitForAck = (
    userInfoToSend: Record<string, unknown>,
    log: TestLogFn,
    complication: boolean = false,
  ) => {
    return new Promise((resolve, reject) => {
      if (complication) {
        transferCurrentComplicationUserInfo(userInfoToSend);
      } else {
        transferUserInfo(userInfoToSend);
      }

      const unsubscribe = watchEvents.addListener('message', (payload) => {
        if (payload) {
          log('Received message: ' + JSON.stringify(payload));
        }
        if (payload?.text === 'user info received by the watch') {
          unsubscribe();
          const userInfo = payload && payload['user-info'];
          if (typeof userInfo === 'object') {
            resolve(userInfo);
          } else {
            reject(new Error('Invalid payload'));
          }
        }
      });

      log('sent user info: ' + JSON.stringify(userInfoToSend));
      log('waiting for acknowledgement from watch');
    });
  };
}
