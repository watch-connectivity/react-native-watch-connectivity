import {IntegrationTest} from '../IntegrationTest';
import {TestLogFn} from './util';
import {sendMessage, watchEvents} from 'react-native-watch-connectivity';
import {TestFnOpts} from './index';
import {UnsubscribeFn} from 'react-native-watch-connectivity/events';

export class MessagesIntegrationTest extends IntegrationTest {
  constructor() {
    super('Messages');
    this.registerTest('Send message', 'reachable', this.testSendMessage);
    this.registerTest(
      'Subscribe to messages',
      'reachable',
      this.testSubscribeToMessages,
    );
    this.registerTest(
      'Reply to messages from watch',
      'reachable',
      this.testReplyToMessagesFromWatch,
    );
  }

  testSendMessage = async ({log}: TestFnOpts) => {
    const resp = await this.sendMessage('Reply to this message', log);
    log('sent message');

    if (resp !== 'Here is your reply') {
      throw new Error('Invalid response');
    }
  };

  testSubscribeToMessages = ({log, after}: TestFnOpts) => {
    let unsubscribe: UnsubscribeFn = () => {};

    after(() => unsubscribe?.());

    return new Promise((resolve) => {
      unsubscribe = watchEvents.addListener('message', (message) => {
        log('Received message ' + JSON.stringify(message));
        if (message?.text === "Here's your message") {
          log('Unsubscribed');
          resolve();
        }
      });
      log('Subscribed to messages');
      let message = {test: true, text: 'Send me a message, please'};
      sendMessage(message);
      log('Sent message: ' + JSON.stringify(message));
    });
  };

  testReplyToMessagesFromWatch = ({log, after}: TestFnOpts) => {
    let unsubscribe: UnsubscribeFn = () => {};

    after(() => unsubscribe?.());

    return new Promise((resolve, reject) => {
      let receivedFirstMessage = false;
      unsubscribe = watchEvents.addListener('message', (message, reply) => {
        log('Received message ' + JSON.stringify(message));
        if (message?.text === "Here's your message") {
          receivedFirstMessage = true;
          log('Replied');
          if (reply) {
            reply({test: true, text: "And here's a response"});
          } else {
            reject(new Error('Missing reply handler'));
          }
        } else if (message?.text === 'Received your reply!') {
          if (receivedFirstMessage) {
            log('The watch received our reply!');
            resolve();
          } else {
            reject(new Error(''));
          }
        }
      });
      log('Subscribed to messages');
      sendMessage({test: true, text: 'Send me a message, please'});
      log('Sent message');
    });
  };

  private sendMessage(text: string, log: TestLogFn): Promise<string> {
    return new Promise((resolve, reject) => {
      sendMessage(
        {test: true, text},
        (reply) => {
          if (reply) {
            log('Received reply: ' + JSON.stringify(reply));
          }
          if (reply.text && typeof reply.text === 'string') {
            resolve(reply.text);
          } else {
            reject(new Error('Incorrect response'));
          }
        },
        (err) => {
          reject(err);
        },
      );
    });
  }
}
