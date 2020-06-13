import {IntegrationTest} from '../IntegrationTest';
import {TestLogFn} from './util';
import {sendWatchMessage, subscribeToMessages} from 'react-native-watch-connectivity';

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

  testSendMessage = async (log: TestLogFn) => {
    const resp = await this.sendMessage('Reply to this message', log);
    log('sent message');

    if (resp !== 'Here is your reply') {
      throw new Error('Invalid response');
    }
  };

  testSubscribeToMessages = (log: TestLogFn) => {
    return new Promise((resolve) => {
      const unsubscribe = subscribeToMessages((message) => {
        log('Received message ' + JSON.stringify(message));
        if (message?.text === "Here's your message") {
          unsubscribe();
          log('Unsubscribed');
          resolve();
        }
      });
      log('Subscribed to messages');
      let message = {test: true, text: 'Send me a message, please'};
      sendWatchMessage(message);
      log('Sent message: ' + JSON.stringify(message));
    });
  };

  testReplyToMessagesFromWatch = (log: TestLogFn) => {
    return new Promise((resolve, reject) => {
      let receivedFirstMessage = false;
      const unsubscribe = subscribeToMessages((message, reply) => {
        log('Received message ' + JSON.stringify(message));
        if (message?.text === "Here's your message") {
          receivedFirstMessage = true;
          log('Replied');
          if (reply) {
            reply({test: true, text: "And here's a response"});
          } else {
            unsubscribe();
            reject(new Error('Missing reply handler'));
          }
        } else if (message?.text === 'Received your reply!') {
          if (receivedFirstMessage) {
            log('The watch received our reply!');
            unsubscribe();
            resolve();
          } else {
            unsubscribe();
            reject(new Error(''));
          }
        }
      });
      log('Subscribed to messages');
      sendWatchMessage({test: true, text: 'Send me a message, please'});
      log('Sent message');
    });
  };

  private sendMessage(text: string, log: TestLogFn): Promise<string> {
    return new Promise((resolve, reject) => {
      sendWatchMessage({test: true, text}, (err, reply) => {
        if (reply) {
          log('Received reply: ' + JSON.stringify(reply));
        }
        if (err) {
          reject(err);
        } else if (reply && reply.text && typeof reply.text === 'string') {
          resolve(reply.text);
        } else {
          reject(new Error('Incorrect response'));
        }
      });
    });
  }
}
