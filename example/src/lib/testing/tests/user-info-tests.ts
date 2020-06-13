import {IntegrationTest} from '../IntegrationTest';

import {isEqual} from 'lodash';
import {assert, TestLogFn} from './util';
import * as faker from 'faker';
import {
  clearUserInfoQueue,
  dequeueUserInfo,
  getQueuedUserInfo,
  QueuedUserInfo,
  sendWatchMessage,
  subscribeToMessages,
  subscribeToUserInfo,
  transferCurrentComplicationUserInfo,
  transferUserInfo,
} from 'react-native-watch-connectivity';

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
    await clearUserInfoQueue();
    const sentUserInfo = {uid: faker.lorem.word(), name: faker.lorem.words(2)};
    const receivedUserInfo = await this.sendUserInfoAndWaitForAck(
      sentUserInfo,
      log,
    );
    assert(isEqual(sentUserInfo, receivedUserInfo));
  };

  testTransferComplicationUserInfo = async (log: TestLogFn) => {
    await clearUserInfoQueue();
    const sentUserInfo = {uid: faker.lorem.word(), name: faker.lorem.words(2)};
    const receivedUserInfo = await this.sendUserInfoAndWaitForAck(
      sentUserInfo,
      log,
      true,
    );
    assert(isEqual(sentUserInfo, receivedUserInfo));
  };

  testSubscribeToUserInfo = async (log: TestLogFn) => {
    return clearUserInfoQueue().then(
      () =>
        new Promise((resolve, reject) => {
          const expectedUserInfo = {
            uid: 'xyz',
            name: 'bob',
            email: 'bob@example.com',
          };

          const unsubscribe = subscribeToUserInfo(
            ({userInfo: userInfoFromEvent}) => {
              log(
                'received user info from watch event: ' +
                  JSON.stringify(userInfoFromEvent),
              );
              unsubscribe();
              if (!isEqual(userInfoFromEvent, expectedUserInfo)) {
                reject(new Error('User info did not match'));
              }
              resolve();
            },
          );

          sendWatchMessage({test: true, text: 'send me some user info'});
          log('requested user info from watch');
        }),
    );
  };

  testUserInfoQueue = async (log: TestLogFn) => {
    return clearUserInfoQueue().then(async () => {
      const userInfoPromise = new Promise((resolve) => {
        const receivedUserInfo: QueuedUserInfo[] = [];

        const unsubscribe = subscribeToUserInfo((userInfo) => {
          log('Received user info: ' + JSON.stringify(userInfo));
          receivedUserInfo.push(userInfo);
          if (receivedUserInfo.length === 2) {
            unsubscribe();
            resolve();
          }
        });
      });

      let message = {test: true, text: 'send me some user info'};
      log('sent message: ' + JSON.stringify(message));
      sendWatchMessage(message);

      message = {test: true, text: 'send me some more user info'};
      log('sent message: ' + JSON.stringify(message));
      sendWatchMessage(message);

      await userInfoPromise;

      let queuedUserInfo = await getQueuedUserInfo();

      log('user info: ' + JSON.stringify(queuedUserInfo));

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
        queuedUserInfo.length === 2,
        'should have two queued user records',
      );

      assert(
        isEqual(firstExpectedUserInfo, queuedUserInfo[0].userInfo),
        'first record should match',
      );
      assert(
        isEqual(secondExpectedUserInfo, queuedUserInfo[1].userInfo),
        'second record should match',
      );

      log('dequeueing user info');

      const returnedUserInfo = await dequeueUserInfo(queuedUserInfo[0].id);

      queuedUserInfo = await getQueuedUserInfo();

      assert(isEqual(queuedUserInfo, returnedUserInfo));

      log('user info now has length ' + queuedUserInfo.length);

      assert(
        queuedUserInfo.length === 1,
        'should have cleared out one user info record',
      );

      assert(
        isEqual(secondExpectedUserInfo, queuedUserInfo[0].userInfo),
        'should have dequeued the correct user info record',
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

      const unsubscribe = subscribeToMessages((payload) => {
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
